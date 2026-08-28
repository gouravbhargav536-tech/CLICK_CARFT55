import express from "express";
import path from "path";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

// Helper to retry transient Gemini API errors (429, 500, 502, 503, 504) with exponential backoff & jitter
async function retryGeminiOperation<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 1000
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      const errorMessage = String(error?.message || error || "");
      const status = error?.status || error?.statusCode;

      const isTransient =
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        errorMessage.includes("503") ||
        errorMessage.includes("UNAVAILABLE") ||
        errorMessage.includes("429") ||
        errorMessage.includes("RESOURCE_EXHAUSTED") ||
        errorMessage.includes("high demand") ||
        errorMessage.includes("overloaded") ||
        errorMessage.includes("Service Unavailable");

      if (!isTransient || attempt > maxRetries) {
        throw error;
      }

      // Exponential backoff: ~1s, ~2s, ~4s + jitter
      const delay = initialDelayMs * Math.pow(2, attempt - 1) + Math.random() * 300;
      console.warn(
        `[Gemini Retry] Transient error encountered (attempt ${attempt}/${maxRetries}): ${errorMessage}. Retrying in ${Math.round(delay)}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Helper to initialize Gemini SDK safely
  function getGeminiAI(customApiKey?: string) {
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables and no custom key provided.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // --- API ROUTES ---

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // API Key Validator Endpoint (Performs low-latency test for Gemini or Groq)
  app.post("/api/validate-key", async (req, res) => {
    const { provider, apiKey } = req.body;
    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      res.status(400).json({
        valid: false,
        error: "API key cannot be empty.",
      });
      return;
    }

    const cleanKey = apiKey.trim();
    const startTime = Date.now();

    if (provider === "gemini") {
      try {
        const client = new GoogleGenAI({
          apiKey: cleanKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build-validator",
            },
          },
        });

        // Ultra low-latency minimal token test with gemini-2.5-flash
        await client.models.generateContent({
          model: "gemini-2.5-flash",
          contents: "ping",
          config: {
            maxOutputTokens: 1,
            temperature: 0,
          },
        });

        const latencyMs = Date.now() - startTime;
        res.json({
          valid: true,
          provider: "gemini",
          latencyMs,
          model: "gemini-2.5-flash",
          message: `Gemini API key is active and verified (${latencyMs}ms latency).`,
        });
      } catch (error: any) {
        const latencyMs = Date.now() - startTime;
        const errorMsg = error?.message || "Invalid Gemini API Key or permission denied.";
        console.error("[Gemini Key Validation Error]:", errorMsg);
        res.status(400).json({
          valid: false,
          provider: "gemini",
          latencyMs,
          error: errorMsg.includes("API_KEY_INVALID")
            ? "Invalid Gemini API Key: Please check your API key in Google AI Studio."
            : errorMsg,
        });
      }
    } else if (provider === "groq") {
      try {
        // Fast, low-latency call to Groq API models endpoint
        const groqRes = await fetch("https://api.groq.com/openai/v1/models", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cleanKey}`,
            "Content-Type": "application/json",
          },
        });

        const latencyMs = Date.now() - startTime;
        if (groqRes.ok) {
          const data: any = await groqRes.json();
          const modelCount = data?.data?.length || 0;
          res.json({
            valid: true,
            provider: "groq",
            latencyMs,
            model: "llama-3.3-70b-versatile",
            message: `Groq API key verified! Access to ${modelCount} models confirmed (${latencyMs}ms latency).`,
          });
        } else {
          const errJson: any = await groqRes.json().catch(() => ({}));
          const message =
            errJson?.error?.message ||
            (groqRes.status === 401
              ? "Invalid Groq API Key (401 Unauthorized): Please verify key in Groq Console."
              : `Groq API returned HTTP status ${groqRes.status}`);
          res.status(400).json({
            valid: false,
            provider: "groq",
            latencyMs,
            error: message,
          });
        }
      } catch (error: any) {
        const latencyMs = Date.now() - startTime;
        res.status(400).json({
          valid: false,
          provider: "groq",
          latencyMs,
          error: error?.message || "Failed to reach Groq API network.",
        });
      }
    } else {
      res.status(400).json({
        valid: false,
        error: `Unsupported provider '${provider}'. Supported providers are 'gemini' and 'groq'.`,
      });
    }
  });

  // Real-time translation endpoint
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, sourceLang = "Auto Detect", targetLang = "English" } = req.body;

      if (!text || typeof text !== "string" || !text.trim()) {
        res.status(400).json({ error: "Text prompt is required for translation." });
        return;
      }

      const ai = getGeminiAI();

      const systemInstruction = `You are AetherVoice Translation Engine, a real-time global translation system.
Translate the input text from '${sourceLang}' to '${targetLang}'.
Analyze nuance, tone, and spoken conversational naturalness.
Provide output STRICTLY matching the requested JSON schema.`;

      const response = await retryGeminiOperation(() =>
        ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `Input Text: "${text}"`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                translatedText: {
                  type: Type.STRING,
                  description: "The primary high-accuracy natural translation into target language.",
                },
                detectedLanguage: {
                  type: Type.STRING,
                  description: "The detected source language name.",
                },
                phoneticSpelling: {
                  type: Type.STRING,
                  description: "Phonetic pronunciation guide (e.g., Romaji, Pinyin, or IPA pronunciation).",
                },
                alternativePhrasing: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "2-3 alternative casual/formal phrasings in target language.",
                },
                culturalNotes: {
                  type: Type.STRING,
                  description: "Brief 1-sentence cultural or contextual usage note if applicable.",
                },
              },
              required: ["translatedText", "detectedLanguage", "phoneticSpelling"],
            },
          },
        })
      );

      const jsonText = response.text || "{}";
      const parsedData = JSON.parse(jsonText);

      res.json({
        success: true,
        data: parsedData,
        originalText: text,
        sourceLang,
        targetLang,
      });
    } catch (error: any) {
      console.error("Translation API Error:", error?.message || error);
      res.status(500).json({
        error: error.message || "Failed to process translation request.",
      });
    }
  });

  // Streaming Conversational AI & Translation Endpoint (SSE)
  app.post("/api/chat-stream", async (req, res) => {
    try {
      const {
        prompt,
        image,
        imageBase64,
        history = [],
        mode = "chat",
        targetLang = "English",
        sourceLang = "Hindi",
        responseMode = "balanced",
        vocalFeeling = "natural",
        accessToken,
        customGeminiKey,
      } = req.body;

      if (!prompt || typeof prompt !== "string") {
        res.status(400).json({ error: "Prompt is required." });
        return;
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const ai = getGeminiAI(customGeminiKey);

      // Check for Google Calendar Voice Command Intent
      const lowerPrompt = prompt.toLowerCase();
      let calendarContextNotice = "";

      const isCalendarListReq =
        lowerPrompt.includes("calendar") ||
        lowerPrompt.includes("events today") ||
        lowerPrompt.includes("upcoming meetings") ||
        lowerPrompt.includes("what's on my schedule") ||
        lowerPrompt.includes("list my meetings") ||
        lowerPrompt.includes("show my schedule") ||
        lowerPrompt.includes("इवेंट") ||
        lowerPrompt.includes("कैलेंडर") ||
        lowerPrompt.includes("मीटिंग");

      const isCalendarScheduleReq =
        (lowerPrompt.includes("schedule") ||
          lowerPrompt.includes("book") ||
          lowerPrompt.includes("create meeting") ||
          lowerPrompt.includes("add event") ||
          lowerPrompt.includes("set up a meeting") ||
          lowerPrompt.includes("मीटिंग") ||
          lowerPrompt.includes("शेड्यूल")) &&
        (lowerPrompt.includes("meeting") ||
          lowerPrompt.includes("call") ||
          lowerPrompt.includes("sync") ||
          lowerPrompt.includes("event") ||
          lowerPrompt.includes("calendar") ||
          lowerPrompt.includes("कल") ||
          lowerPrompt.includes("बजे") ||
          lowerPrompt.includes("appointment"));

      if (isCalendarScheduleReq) {
        try {
          // Extract meeting summary/title
          let summary = "Voice AI Sync";
          if (lowerPrompt.includes("titled")) {
            const parts = prompt.split(/titled/i);
            summary = parts[1]?.trim().split(/(at|on|tomorrow|today|next)/i)[0]?.trim() || summary;
          } else if (lowerPrompt.includes("meeting")) {
            summary = "Voice Scheduled Meeting";
          } else if (lowerPrompt.includes("call")) {
            summary = "Scheduled Call";
          }

          // Parse start date/time heuristically
          const now = new Date();
          let startTime = new Date(now.getTime() + 24 * 3600000); // default tomorrow
          if (lowerPrompt.includes("today")) {
            startTime = new Date(now.getTime() + 2 * 3600000);
          } else if (lowerPrompt.includes("at 3")) {
            startTime.setHours(15, 0, 0, 0);
          } else if (lowerPrompt.includes("at 4")) {
            startTime.setHours(16, 0, 0, 0);
          } else if (lowerPrompt.includes("at 10")) {
            startTime.setHours(10, 0, 0, 0);
          } else {
            startTime.setHours(14, 0, 0, 0);
          }

          const endTime = new Date(startTime.getTime() + 30 * 60000);

          let createdEventMsg = "";
          if (accessToken) {
            const { google } = await import("googleapis");
            const auth = new google.auth.OAuth2();
            auth.setCredentials({ access_token: accessToken });
            const calendar = google.calendar({ version: "v3", auth });

            const createdRes = await calendar.events.insert({
              calendarId: "primary",
              requestBody: {
                summary,
                description: `Scheduled via AetherVoice Voice Command: "${prompt}"`,
                location: "Google Meet",
                start: { dateTime: startTime.toISOString() },
                end: { dateTime: endTime.toISOString() },
              },
            });

            createdEventMsg = `CONFIRMED: Meeting "${createdRes.data.summary || summary}" successfully scheduled on Google Calendar for ${startTime.toLocaleString([], { dateStyle: "full", timeStyle: "short" })} with link ${createdRes.data.htmlLink || 'primary calendar'}.`;
          } else {
            createdEventMsg = `SCHEDULED (PREVIEW MODE): Meeting "${summary}" set for ${startTime.toLocaleString([], { dateStyle: "full", timeStyle: "short" })}. Log in with Google to sync directly to live Google Calendar.`;
          }

          calendarContextNotice = `\n[GOOGLE CALENDAR ACTION EXECUTED]: ${createdEventMsg}`;
        } catch (calErr: any) {
          console.error("Calendar Voice Schedule Error:", calErr?.message || calErr);
          calendarContextNotice = `\n[GOOGLE CALENDAR ACTION NOTICE]: Could not access live Google Calendar. Please make sure Google OAuth sign in is active in your User Profile.`;
        }
      } else if (isCalendarListReq) {
        try {
          if (accessToken) {
            const { google } = await import("googleapis");
            const auth = new google.auth.OAuth2();
            auth.setCredentials({ access_token: accessToken });
            const calendar = google.calendar({ version: "v3", auth });

            const listRes = await calendar.events.list({
              calendarId: "primary",
              timeMin: new Date().toISOString(),
              maxResults: 5,
              singleEvents: true,
              orderBy: "startTime",
            });

            const items = listRes.data.items || [];
            if (items.length === 0) {
              calendarContextNotice = `\n[GOOGLE CALENDAR DATA]: You have no upcoming events scheduled on your primary Google Calendar today.`;
            } else {
              const eventDescriptions = items.map((e, idx) => `${idx + 1}. "${e.summary || 'Untitled Event'}" at ${e.start?.dateTime ? new Date(e.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day'}`).join("; ");
              calendarContextNotice = `\n[GOOGLE CALENDAR DATA]: Here are your real upcoming Google Calendar events: ${eventDescriptions}`;
            }
          } else {
            calendarContextNotice = `\n[GOOGLE CALENDAR DATA]: Sample Schedule: 1. "Voice AI Sync" at 2:00 PM; 2. "Product Roadmap Review" tomorrow at 10:00 AM. Note: Sign in with Google to sync live events.`;
          }
        } catch (calErr: any) {
          console.error("Calendar Voice List Error:", calErr?.message || calErr);
          calendarContextNotice = `\n[GOOGLE CALENDAR NOTICE]: Unable to pull live events right now. Sign in with Google to sync calendar.`;
        }
      }

      let systemInstruction = "";
      if (mode === "translator") {
        systemInstruction = `You are ClickCraft Live Translation Assistant.
Translate the input text from '${sourceLang}' to '${targetLang}'.
Provide a fluid, natural, spoken human translation without markdown asterisks, bold text, or symbols.
Keep the tone professional, warm, and direct.`;
      } else {
        systemInstruction = `आप ClickCraft के आधिकारिक AI असिस्टेंट हैं। ClickCraft एक डिजिटल मार्केटिंग एजेंसी है जो बिज़नेस के लिए टारगेटेड ऐड्स, क्रिएटिव स्ट्रैटेजी, और मापने योग्य ग्रोथ प्रदान करती है।

आपकी भूमिका और कड़े नियम:
1. सिर्फ ClickCraft की सर्विसेज़ और डिजिटल मार्केटिंग से जुड़े सवालों का जवाब दें (जैसे: ऐड्स कैसे बनते हैं, प्राइसिंग/कंसल्टेशन, सोशल मीडिया मार्केटिंग, SEO, कैंपेन स्ट्रैटेजी, Sell Old Car by Ad, Targeted Ads, Creative Strategy, Business Growth, Business Analytics, हमारा प्रोसेस, क्यों चुनें ClickCraft, संपर्क जानकारी आदि)।
2. सिर्फ नीचे [FIREBASE_DATA] में दी गई जानकारी के आधार पर जवाब दें, बाहर से कुछ काल्पनिक मत बनाएं।
3. भाषा का नियम:
   - हिंदी में सवाल आए तो शुद्ध व स्वाभाविक हिंदी में जवाब दें।
   - English में सवाल आए तो fluent, professional English में जवाब दें।
   - Hinglish में सवाल आए तो स्वाभाविक Hinglish/Hindi में जवाब दें।
4. समय-आधारित/लाइव जानकारी:
   - अगर यूज़र समय-आधारित/लाइव जानकारी मांगे (जैसे "अभी कौन सा ऑफर चल रहा है", "current campaign की परफॉर्मेंस", "current running offers", "today's live discount"), तो अपने जवाब में [REALTIME_DATA_NEEDED] टैग जोड़ें ताकि ऐप समझ सके कि यहाँ लाइव API डेटा चाहिए। साथ में बताएं कि लाइव डेटा व ताज़ा ऑफर्स के लिए ClickCraft टीम से +919376124893 या info@clickcraft.com पर संपर्क कर सकते हैं।
5. आउट-ऑफ़-स्कोप (Out of Scope) नियम:
   - अगर यूज़र का सवाल ClickCraft या डिजिटल मार्केटिंग से बिल्कुल अलग है (जैसे मौसम, खेल, जनरल नॉलेज, इतिहास, सामान्य ज्ञान, मूवीज़, पर्सनल सलाह आदि), तो जवाब न बनाएं। इसकी जगह विनम्रता से कहें:
   हिंदी में: "यह ClickCraft या डिजिटल मार्केटिंग से जुड़ा सवाल नहीं है। कृपया हमारी सर्विसेज़ या डिजिटल मार्केटिंग से जुड़ा कोई सवाल पूछें।"
   English में: "This question is not related to ClickCraft or digital marketing. Please ask a question related to our services or digital marketing."
6. आवाज़ (Voice / TTS) के लिए उपयुक्त उत्तर:
   - कोई अनावश्यक markdown symbols (जैसे अत्यधिक **, ##, _) मत use करो, ताकि आवाज़ में सहजता से बोला जा सके।
   - हर जवाब में 'As an AI language model' जैसी बातें मत कहो, सीधे और आत्मविश्वास से ClickCraft के रूप में बात करो।

[FIREBASE_DATA]
{
  "company_name": "ClickCraft",
  "tagline": "Boost Your Business Online",
  "description": "ClickCraft ऐसे डिजिटल ऐड और वेबसाइट बनाता है जो असली ग्राहकों तक पहुँचें और बिज़नेस की ग्रोथ को मापने योग्य बनाएं। चाहे कार बेचनी हो, लोकल बिज़नेस प्रमोट करना हो, या ब्रांड लॉन्च करना हो — ClickCraft आपको सही ऑडियंस से जोड़ता है।",
  "pricing_packages": [
    {
      "id": "advertisement",
      "name": "Advertisement Campaign (विज्ञापन कैंपेन)",
      "price": "₹500",
      "description": "1 टारगेटेड ऐड कैंपेन (Meta/Instagram/Facebook/Google), हाई-कन्वर्शन ग्राफ़िक व कॉपी, लोकल ऑडियंस टारगेटिंग, और डायरेक्ट WhatsApp/फोन पर लीड्स। सिर्फ ₹500 में।"
    },
    {
      "id": "website",
      "name": "Professional Website (वेबसाइट डेवलपमेंट)",
      "price": "₹5,000",
      "description": "कस्टम मॉडर्न रिस्पॉन्सिव बिज़नेस वेबसाइट, फ़ास्ट स्पीड, SEO ऑप्टिमाइज़्ड, डायरेक्ट WhatsApp चैट इंटीग्रेशन, गूगल मैप्स और कॉन्टैक्ट लीड फ़ॉर्म। सिर्फ ₹5,000 में।"
    },
    {
      "id": "premium_combo",
      "name": "Premium Offer (वेबसाइट + 1 हफ़्ते का विज्ञापन कैंपेन)",
      "price": "₹10,000",
      "badge": "BEST VALUE / प्रीमियम ऑफर",
      "description": "कम्प्लीट प्रोफ़ेशनल वेबसाइट (वैल्यू ₹5,000) + पूरे 1 हफ़्ते (7 दिन) का हाई-ROI टारगेटेड ऐड कैंपेन, वीडियो रील्स व मोशन ऐड्स, डेली ऑप्टिमाइज़ेशन, ट्रांसपेरेंट रिपोर्टिंग और डेडिकेटेड मैनेजर। सिर्फ ₹10,000 में।"
    }
  ],
  "services": [
    {
      "name": "Advertisement Campaign (विज्ञापन कैंपेन)",
      "price": "₹500",
      "description": "₹500 में 1 टारगेटेड ऐड कैंपेन जो तुरंत लोकल ग्राहकों से पूछताछ और कॉल्स लाता है।"
    },
    {
      "name": "Professional Website (वेबसाइट निर्माण)",
      "price": "₹5,000",
      "description": "₹5,000 में आधुनिक, तेज़ और मोबाइल-फ्रेंडली बिज़नेस वेबसाइट।"
    },
    {
      "name": "Premium Offer (Website + 1 Week Ads)",
      "price": "₹10,000",
      "description": "₹10,000 में वेबसाइट + 1 हफ़्ते का लाइव विज्ञापन कैंपेन — बिज़नेस को ऑनलाइन शुरू और स्केल करने का सबसे बेस्ट कॉम्बो।"
    },
    {
      "name": "Targeted Ads",
      "description": "आपके ऑडियंस के हिसाब से कस्टम कैंपेन बनाए जाते हैं, ताकि हर क्लिक की वैल्यू हो, फालतू खर्च न हो"
    },
    {
      "name": "Creative Strategy",
      "description": "क्रिएटिव टीम विज़ुअल्स और कॉपी को इस तरह मिलाती है कि ब्राउज़र करने वाले लोग असली खरीदार बनें"
    },
    {
      "name": "Sell Old Car by Ad",
      "description": "हाई-इम्पैक्ट कार ऐड्स जो असली, सीरियस खरीदार लाते हैं और गाड़ी जल्दी बिकवाते हैं — यह ClickCraft की खास/यूनिक सर्विस है"
    }
  ],
  "process": [
    "1. आपके बिज़नेस और गोल को समझना",
    "2. सही ऑडियंस और प्लेटफॉर्म तय करना (Facebook, Instagram, Google)",
    "3. क्रिएटिव ऐड (विज़ुअल + कॉपी) बनाना",
    "4. कैंपेन लॉन्च और ऑप्टिमाइज़ करना",
    "5. रिपोर्टिंग और रिज़ल्ट ट्रैकिंग"
  ],
  "why_choose_clickcraft": [
    "500+ हैप्पी क्लाइंट्स और 1200+ सफल कैंपेन का अनुभव",
    "5-स्टार क्लाइंट रेटिंग",
    "किफायती और पारदर्शी प्राइसिंग: ₹500 (Ads), ₹5,000 (Website), ₹10,000 (Premium Website + 1 Week Ads)",
    "ट्रांसपेरेंट रिपोर्टिंग — दिखावटी नंबर नहीं, असली डेटा",
    "हर बिज़नेस टाइप के लिए कस्टम स्ट्रैटेजी — छोटी दुकान से लेकर बड़े ब्रांड तक"
  ],
  "achievements": {
    "happy_clients": "500+",
    "successful_campaigns": "1200+",
    "client_rating": "5 star"
  },
  "contact": {
    "email": "info@clickcraft.com",
    "whatsapp": "+919376124893",
    "phone": "+91 9376124893"
  }
}`;
      }

      // Prepare conversation format
      const formattedContents: any[] = [];
      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item.role && item.text) {
            formattedContents.push({
              role: item.role === "user" ? "user" : "model",
              parts: [{ text: item.text }],
            });
          }
        }
      }

      // Build User Turn with Multimodal Image Vision Support
      const userParts: any[] = [];
      const attachedImage = image || imageBase64;
      if (attachedImage && typeof attachedImage === "string") {
        const mimeMatch = attachedImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const rawBase64 = attachedImage.includes(";base64,") ? attachedImage.split(";base64,")[1] : attachedImage;
        userParts.push({
          inlineData: {
            mimeType,
            data: rawBase64,
          },
        });
      }
      userParts.push({ text: prompt + (calendarContextNotice ? `\n${calendarContextNotice}` : "") });

      formattedContents.push({
        role: "user",
        parts: userParts,
      });

      const { modelMode, isThinkingMode, isLowLatency } = req.body;

      const enableSearch =
        req.body.useSearchGrounding ||
        req.body.isWebSearchActive ||
        modelMode === "search" ||
        prompt.toLowerCase().includes("[search grounding enabled]") ||
        prompt.toLowerCase().includes("search live") ||
        prompt.toLowerCase().includes("latest news") ||
        prompt.toLowerCase().includes("today's weather") ||
        prompt.toLowerCase().includes("current price");

      const enableThinking =
        isThinkingMode ||
        modelMode === "thinking" ||
        prompt.toLowerCase().includes("[thinking mode]") ||
        prompt.toLowerCase().includes("think step by step") ||
        prompt.toLowerCase().includes("गहराई से सोचो") ||
        prompt.toLowerCase().includes("complex reasoning");

      const enableLowLatency =
        isLowLatency ||
        modelMode === "low-latency" ||
        responseMode === "quick";

      let selectedModel = "gemini-3.6-flash";
      const geminiConfig: any = {
        systemInstruction,
        temperature: 0.65,
      };

      if (enableThinking) {
        // High thinking mode with gemini-3.1-pro-preview
        selectedModel = "gemini-3.1-pro-preview";
        geminiConfig.thinkingConfig = { thinkingLevel: "HIGH" };
      } else if (enableSearch) {
        // Search Grounding with gemini-3.5-flash
        selectedModel = "gemini-3.5-flash";
        geminiConfig.tools = [{ googleSearch: {} }];
      } else if (enableLowLatency) {
        // Low latency responses with gemini-3.1-flash-lite
        selectedModel = "gemini-3.1-flash-lite";
        geminiConfig.temperature = 0.5;
      }

      let responseStream;
      try {
        responseStream = await retryGeminiOperation(() =>
          ai.models.generateContentStream({
            model: selectedModel,
            contents: formattedContents,
            config: geminiConfig,
          })
        );

        for await (const chunk of responseStream) {
          const textChunk = chunk.text;
          if (textChunk) {
            res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
          }
        }
      } catch (geminiError: any) {
        console.warn("[Gemini API Quota/Error Notice] Falling back to Firebase Knowledge Base:", geminiError?.message || geminiError);
        
        // Intelligent fallback directly from Firebase Data
        const lowerQ = prompt.toLowerCase();
        let fallbackText = "";
        
        if (lowerQ.includes("500") || lowerQ.includes("ad") || lowerQ.includes("प्राइस") || lowerQ.includes("cost") || lowerQ.includes("campaign")) {
          fallbackText = "ClickCraft का ₹500 वाला Advertisement Campaign पैकेज 1 हाई-कन्वर्टिंग ऐड कैंपेन (Instagram/Facebook/Google), ग्राफिक डिज़ाइन और लोकल ऑडियंस टारगेटिंग के साथ आता है। सभी ग्राहक लीड्स सीधे आपके WhatsApp (+91 9376124893) पर आती हैं।";
        } else if (lowerQ.includes("5000") || lowerQ.includes("website") || lowerQ.includes("वेबसाइट")) {
          fallbackText = "ClickCraft का Professional Website पैकेज ₹5,000 में उपलब्ध है, जिसमें मोबाइल-रिस्पॉन्सिव बिज़नेस वेबसाइट, SEO ऑप्टिमाइज़ेशन, WhatsApp चैट बटन और SSL सिक्योरिटी शामिल है।";
        } else if (lowerQ.includes("10000") || lowerQ.includes("combo") || lowerQ.includes("premium")) {
          fallbackText = "ClickCraft का ₹10,000 वाला Premium Combo Offer सबसे बेहतरीन वैल्यू है: इसमें पूरी Professional Website (वैल्यू ₹5,000) और 1 हफ़्ते का हाई-ROI टारगेटेड ऐड कैंपेन + वीडियो रील्स शामिल हैं।";
        } else if (lowerQ.includes("car") || lowerQ.includes("गाड़ी") || lowerQ.includes("कार")) {
          fallbackText = "ClickCraft का 'Sell Old Car by Ad' सर्विस बिना किसी डीलर कमीशन के आपकी पुरानी गाड़ी को वीडियो ऐड्स के ज़रिए सीधे लोकल खरीदारों तक पहुँचाकर तेज़ी से बिकवाता है।";
        } else if (lowerQ.includes("whatsapp") || lowerQ.includes("contact") || lowerQ.includes("phone") || lowerQ.includes("संपर्क")) {
          fallbackText = "ClickCraft टीम से संपर्क करने के लिए WhatsApp या कॉल करें: +91 9376124893, या ईमेल करें: info@clickcraft.com। हमारी टीम 24/7 सहायता के लिए उपलब्ध है। [REALTIME_CONSULTATION]";
        } else {
          fallbackText = "ClickCraft डिजिटल मार्केटिंग एजेंसी है जो आपके बिज़नेस के लिए टारगेटेड सोशल मीडिया ऐड्स (Meta, Google), प्रोफेशनल वेबसाइट्स (₹5,000) और क्रिएटिव स्ट्रैटेजी प्रदान करती है। अधिक जानकारी या पैकेज बुक करने के लिए WhatsApp (+91 9376124893) पर संपर्क करें।";
        }

        // Stream fallback text smoothly in small words/chunks
        const words = fallbackText.split(" ");
        for (let i = 0; i < words.length; i += 3) {
          const chunk = words.slice(i, i + 3).join(" ") + " ";
          res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
          await new Promise((resolve) => setTimeout(resolve, 35));
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error: any) {
      console.error("Chat Stream Fatal Error:", error?.message || error);
      res.write(`data: ${JSON.stringify({ text: "ClickCraft डिजिटल मार्केटिंग असिस्टेंट: हमारी सर्विसेज़ (₹500 Ads, ₹5000 Website, ₹10000 Combo) और अधिक जानकारी के लिए WhatsApp (+91 9376124893) पर संपर्क करें।" })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    }
  });

  // Dedicated Multimodal Vision Analysis Endpoint
  app.post("/api/vision/analyze", async (req, res) => {
    try {
      const { image, prompt = "Describe and analyze this image in detail.", language = "Hindi" } = req.body;

      if (!image || typeof image !== "string") {
        res.status(400).json({ error: "Image data (base64) is required." });
        return;
      }

      const ai = getGeminiAI();
      const mimeMatch = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const rawBase64 = image.includes(";base64,") ? image.split(";base64,")[1] : image;

      const response = await retryGeminiOperation(() =>
        ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: rawBase64,
                  },
                },
                {
                  text: `You are AetherVoice Multimodal Vision Intelligence.
Analyze this image in detail. Primary response language: ${language}.
Provide a clear, articulate, insightful, human-friendly explanation of what you see (objects, text, emotion, context, surroundings, colors).
Prompt: ${prompt}`,
                },
              ],
            },
          ],
        })
      );

      res.json({
        success: true,
        analysis: response.text || "No description generated.",
      });
    } catch (error: any) {
      console.error("Vision Analysis API Error:", error?.message || error);
      res.status(500).json({ error: error?.message || "Failed to analyze image." });
    }
  });

  // Streaming Text-To-Speech (TTS) via Gemini Audio Stream
  app.post("/api/tts-stream", async (req, res) => {
    try {
      const { text, voiceName = "Aoede" } = req.body;

      if (!text || typeof text !== "string") {
        res.status(400).json({ error: "Text parameter is required." });
        return;
      }

      // Clean markdown syntax for ultra-smooth natural human speech
      const cleanText = text
        .replace(/[*#_~`]/g, "")
        .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
        .trim();

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const ai = getGeminiAI();

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: cleanText || text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || "Aoede" },
            },
          },
        },
      });

      for await (const chunk of responseStream) {
        const candidate = chunk.candidates?.[0];
        const part = candidate?.content?.parts?.[0];
        if (part?.inlineData?.data) {
          res.write(
            `data: ${JSON.stringify({
              audioChunk: part.inlineData.data,
              mimeType: part.inlineData.mimeType || "audio/mp3",
            })}\n\n`
          );
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error: any) {
      console.error("TTS Stream API Error:", error?.message || error);
      res.write(
        `data: ${JSON.stringify({
          error: error.message || "TTS streaming failed.",
        })}\n\n`
      );
      res.write("data: [DONE]\n\n");
      res.end();
    }
  });

  // Text-To-Speech (TTS) via Gemini TTS API (Fallback non-streaming)
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voiceName = "Aoede" } = req.body;

      if (!text || typeof text !== "string") {
        res.status(400).json({ error: "Text parameter is required." });
        return;
      }

      // Clean markdown syntax for ultra-smooth natural human speech
      const cleanText = text
        .replace(/[*#_~`]/g, "")
        .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
        .trim();

      const ai = getGeminiAI();

      const response = await retryGeminiOperation(() =>
        ai.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: [{ parts: [{ text: cleanText || text }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceName || "Aoede" },
              },
            },
          },
        })
      );

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (base64Audio) {
        res.json({
          success: true,
          audioBase64: base64Audio,
          mimeType: "audio/mp3",
        });
      } else {
        res.status(500).json({ error: "Audio generation yielded no output." });
      }
    } catch (error: any) {
      console.error("TTS API Error:", error?.message || error);
      const errorMessage = String(error?.message || error || "");
      const isBusy =
        error?.status === 503 ||
        error?.status === 429 ||
        errorMessage.includes("503") ||
        errorMessage.includes("UNAVAILABLE") ||
        errorMessage.includes("high demand") ||
        errorMessage.includes("overloaded");

      res.status(isBusy ? 503 : 500).json({
        error: isBusy
          ? "Voice service is temporarily busy. Please try again in a few seconds."
          : error.message || "Speech synthesis failed.",
        isBusy,
      });
    }
  });

  // --- CLOUD SQL USER PROFILE & AUTH ROUTES ---

  // Cloud SQL Database Status Endpoint
  app.get("/api/cloudsql/status", async (req, res) => {
    try {
      const { createPool } = await import("./src/db/index.ts");
      const pool = createPool();
      const client = await pool.connect();
      const result = await client.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
      );
      client.release();
      res.json({
        success: true,
        database: process.env.SQL_DB_NAME || "Cloud SQL (PostgreSQL)",
        host: process.env.SQL_HOST,
        tables: result.rows.map((r: any) => r.table_name),
      });
    } catch (error: any) {
      console.error("Cloud SQL status error:", error);
      res.status(500).json({ error: "Failed to connect to Cloud SQL database", details: error.message });
    }
  });

  // User Auth Profile Sync Endpoint
  app.post("/api/auth/sync", async (req, res) => {
    try {
      const { uid, email, displayName, photoUrl } = req.body;
      if (!uid || !email) {
        res.status(400).json({ error: "UID and Email are required for sync" });
        return;
      }
      const { getOrCreateUser, getUserProfileData } = await import("./src/db/users.ts");
      await getOrCreateUser(uid, email, displayName, photoUrl);
      const profileData = await getUserProfileData(uid);
      res.json({ success: true, data: profileData });
    } catch (error: any) {
      console.error("User sync error:", error);
      res.status(500).json({ error: "Failed to sync user with Cloud SQL", details: error.message });
    }
  });

  // User Profile Update Endpoint
  app.post("/api/auth/profile", async (req, res) => {
    try {
      const { uid, bio, spaceTheme, vocalPreference, preferredLanguage } = req.body;
      if (!uid) {
        res.status(400).json({ error: "UID is required" });
        return;
      }
      const { updateUserProfileData } = await import("./src/db/users.ts");
      const updated = await updateUserProfileData(uid, {
        bio,
        spaceTheme,
        vocalPreference,
        preferredLanguage,
      });
      res.json({ success: true, data: updated });
    } catch (error: any) {
      console.error("User profile update error:", error);
      res.status(500).json({ error: "Failed to update user profile", details: error.message });
    }
  });

  // --- GOOGLE WORKSPACE INTEGRATIONS API (Gmail, Calendar, Tasks, Chat, Classroom, Contacts) ---
  app.post("/api/workspace/summary", async (req, res) => {
    try {
      const { accessToken, service } = req.body;
      const { google } = await import("googleapis");

      if (accessToken) {
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });

        if (service === 'gmail') {
          const gmail = google.gmail({ version: 'v1', auth });
          const listRes = await gmail.users.messages.list({ userId: 'me', maxResults: 5 });
          const messages = listRes.data.messages || [];
          res.json({ success: true, service: 'gmail', count: messages.length, items: messages });
          return;
        }

        if (service === 'calendar') {
          const calendar = google.calendar({ version: 'v3', auth });
          const eventsRes = await calendar.events.list({ calendarId: 'primary', timeMin: new Date().toISOString(), maxResults: 5, singleEvents: true, orderBy: 'startTime' });
          res.json({ success: true, service: 'calendar', items: eventsRes.data.items || [] });
          return;
        }

        if (service === 'tasks') {
          const tasks = google.tasks({ version: 'v1', auth });
          const tasksRes = await tasks.tasks.list({ tasklist: '@default', maxResults: 5 });
          res.json({ success: true, service: 'tasks', items: tasksRes.data.items || [] });
          return;
        }
      }

      // Fallback workspace mock summary if OAuth token is being authorized
      res.json({
        success: true,
        service,
        status: "connected",
        message: `Google Workspace ${service} integration active for profile sync.`,
      });
    } catch (error: any) {
      console.error(`Workspace API error (${req.body.service}):`, error?.message || error);
      res.json({
        success: true,
        service: req.body.service,
        status: "ready",
        message: `Google Workspace ${req.body.service} ready. Log in with Google to sync real data.`,
      });
    }
  });

  // --- GOOGLE CALENDAR INTEGRATION API ---
  app.post("/api/calendar/list", async (req, res) => {
    try {
      const { accessToken, maxResults = 10, timeMin } = req.body;
      const { google } = await import("googleapis");

      if (accessToken) {
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });
        const calendar = google.calendar({ version: "v3", auth });

        const eventsRes = await calendar.events.list({
          calendarId: "primary",
          timeMin: timeMin || new Date().toISOString(),
          maxResults: Number(maxResults) || 10,
          singleEvents: true,
          orderBy: "startTime",
        });

        res.json({
          success: true,
          items: eventsRes.data.items || [],
          message: "Fetched live Google Calendar events.",
        });
        return;
      }

      // Demo/sample schedule fallback if Google token is not connected yet
      const demoStart = new Date();
      demoStart.setHours(demoStart.getHours() + 2);
      const demoEnd = new Date(demoStart.getTime() + 45 * 60000);

      const demoEvents = [
        {
          id: "demo-1",
          summary: "Voice AI & Space Systems Sync",
          description: "Review AetherVoice Google Calendar voice command capabilities.",
          start: { dateTime: demoStart.toISOString() },
          end: { dateTime: demoEnd.toISOString() },
          location: "Google Meet",
          status: "confirmed",
          htmlLink: "https://calendar.google.com/",
        },
        {
          id: "demo-2",
          summary: "Product Roadmap Review",
          description: "Quarterly strategy and workspace AI integrations.",
          start: { dateTime: new Date(Date.now() + 86400000).toISOString() },
          end: { dateTime: new Date(Date.now() + 86400000 + 3600000).toISOString() },
          location: "Conference Room Alpha",
          status: "confirmed",
          htmlLink: "https://calendar.google.com/",
        },
      ];

      res.json({
        success: true,
        items: demoEvents,
        message: "Showing sample schedule. Log in with Google in User Profile to sync live Google Calendar events.",
      });
    } catch (error: any) {
      console.error("Calendar List API Error:", error?.message || error);
      res.status(500).json({ error: error?.message || "Failed to fetch calendar events." });
    }
  });

  app.post("/api/calendar/create", async (req, res) => {
    try {
      const {
        accessToken,
        summary,
        description = "",
        start,
        end,
        durationMinutes = 30,
        location = "",
      } = req.body;

      if (!summary) {
        res.status(400).json({ error: "Event summary/title is required." });
        return;
      }

      let startTimeDate = start ? new Date(start) : new Date();
      if (isNaN(startTimeDate.getTime())) {
        startTimeDate = new Date();
      }

      let endTimeDate = end ? new Date(end) : new Date(startTimeDate.getTime() + (durationMinutes || 30) * 60000);
      if (isNaN(endTimeDate.getTime())) {
        endTimeDate = new Date(startTimeDate.getTime() + 30 * 60000);
      }

      const { google } = await import("googleapis");

      if (accessToken) {
        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: accessToken });
        const calendar = google.calendar({ version: "v3", auth });

        const createdEventRes = await calendar.events.insert({
          calendarId: "primary",
          requestBody: {
            summary,
            description,
            location,
            start: { dateTime: startTimeDate.toISOString() },
            end: { dateTime: endTimeDate.toISOString() },
          },
        });

        res.json({
          success: true,
          event: createdEventRes.data,
          message: `Successfully scheduled "${summary}" on Google Calendar.`,
        });
        return;
      }

      // Fallback if token is missing
      const createdEvent = {
        id: `evt-${Date.now()}`,
        summary,
        description: description || "Scheduled via AetherVoice Assistant",
        start: { dateTime: startTimeDate.toISOString() },
        end: { dateTime: endTimeDate.toISOString() },
        location: location || "Google Meet",
        status: "confirmed",
        htmlLink: "https://calendar.google.com/",
      };

      res.json({
        success: true,
        event: createdEvent,
        message: `Scheduled "${summary}" in preview view. Sign in with Google to sync live to Google Calendar.`,
      });
    } catch (error: any) {
      console.error("Calendar Create API Error:", error?.message || error);
      res.status(500).json({ error: error?.message || "Failed to schedule event on Google Calendar." });
    }
  });

  // Conversation Session Summarization Endpoint
  app.post("/api/summarize", async (req, res) => {
    try {
      const { messages = [], sourceLang = "Auto Detect", targetLang = "English" } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: "Session messages are required for summarization." });
        return;
      }

      const ai = getGeminiAI();

      const conversationText = messages
        .map((m: any) => `[${m.role?.toUpperCase() || "SPEAKER"}]: ${m.text}${m.translatedText ? ` (Translated: ${m.translatedText})` : ""}`)
        .join("\n");

      const systemInstruction = `You are an executive AI voice assistant analyst for AetherVoice.
Analyze the provided transcript between user and model (Languages: ${sourceLang} -> ${targetLang}).
Generate a concise, insightful session summary with key topics and key takeaways or action items.
Respond STRICTLY with the requested JSON schema.`;

      const response = await retryGeminiOperation(() =>
        ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `Transcript to Summarize:\n${conversationText}`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overview: {
                  type: Type.STRING,
                  description: "A concise 2-3 sentence high-level summary of the session.",
                },
                keyTopics: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of 2-4 main subjects or topics discussed.",
                },
                takeaways: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Key takeaways, translations noted, or action items.",
                },
                sentiment: {
                  type: Type.STRING,
                  description: "Brief sentiment or tone assessment (e.g. Collaborative, Inquisitive, Casual, Formal).",
                },
              },
              required: ["overview", "keyTopics", "takeaways"],
            },
          },
        })
      );

      const jsonText = response.text || "{}";
      const parsedData = JSON.parse(jsonText);

      res.json({
        success: true,
        summary: parsedData,
      });
    } catch (error: any) {
      console.error("Summarization API Error:", error?.message || error);
      res.status(500).json({
        error: error.message || "Failed to generate conversation summary.",
      });
    }
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AetherVoice Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
