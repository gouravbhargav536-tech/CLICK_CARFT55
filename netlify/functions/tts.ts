// Netlify Serverless Function for Google Cloud Text-to-Speech (hi-IN-Wavenet-A)

interface NetlifyEvent {
  httpMethod: string;
  body: string | null;
  headers: Record<string, string>;
}

interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

export async function handler(event: NetlifyEvent): Promise<NetlifyResponse> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Content-Type": "application/json",
  };

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: "",
    };
  }

  // Health check endpoint for easy debugging in production
  if (event.httpMethod === "GET") {
    const detectedKeyName =
      process.env.GOOGLE_TTS_API_KEY ? "GOOGLE_TTS_API_KEY" :
      process.env.GOOGLE_CLOUD_API_KEY ? "GOOGLE_CLOUD_API_KEY" :
      process.env.GEMINI_API_KEY ? "GEMINI_API_KEY" :
      process.env.GOOGLE_API_KEY ? "GOOGLE_API_KEY" :
      process.env.TTS_API_KEY ? "TTS_API_KEY" : null;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: "ok",
        service: "ClickCraft Netlify TTS Function",
        keyConfigured: !!detectedKeyName,
        activeEnvVar: detectedKeyName || "None (Please set GOOGLE_TTS_API_KEY in Netlify settings)",
        supportedEnvVars: [
          "GOOGLE_TTS_API_KEY",
          "GOOGLE_CLOUD_API_KEY",
          "GEMINI_API_KEY",
          "GOOGLE_API_KEY",
          "TTS_API_KEY"
        ],
        timestamp: new Date().toISOString(),
      }),
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed. Use POST." }),
    };
  }

  try {
    const payload = event.body ? JSON.parse(event.body) : {};
    const text = payload.text;

    if (!text || typeof text !== "string" || !text.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing 'text' field in request body." }),
      };
    }

    // Read API key in order of priority
    const apiKey = (
      process.env.GOOGLE_TTS_API_KEY ||
      process.env.GOOGLE_CLOUD_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.TTS_API_KEY ||
      payload.apiKey ||
      ""
    ).trim();

    if (!apiKey) {
      console.error("[Netlify TTS Error]: No Google Cloud TTS API key found in environment variables.");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "Google Cloud TTS API key is not configured.",
          details: "Please add GOOGLE_TTS_API_KEY (or GOOGLE_CLOUD_API_KEY / GEMINI_API_KEY) in Netlify Environment Variables.",
        }),
      };
    }

    const languageCode = payload.languageCode || "hi-IN";
    const voiceName = payload.voiceName || "hi-IN-Wavenet-A";
    const speakingRate = typeof payload.speakingRate === "number" ? payload.speakingRate : 0.95;
    const pitch = typeof payload.pitch === "number" ? payload.pitch : 0.0;

    // Call Google Cloud Text-to-Speech REST API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            text: text.trim(),
          },
          voice: {
            languageCode,
            name: voiceName,
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate,
            pitch,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Netlify Google Cloud TTS API Error]:", response.status, errorText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: "Failed to synthesize speech with Google Cloud TTS",
          statusCode: response.status,
          details: errorText,
        }),
      };
    }

    const data = await response.json();

    if (!data.audioContent) {
      console.error("[Netlify TTS Error]: Google Cloud TTS returned empty audioContent.");
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: "Google Cloud TTS did not return audioContent",
          details: data,
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        audioContent: data.audioContent,
      }),
    };
  } catch (error: any) {
    console.error("[Netlify TTS Serverless Function Error]:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error?.message || "Internal server error during speech synthesis.",
      }),
    };
  }
}
