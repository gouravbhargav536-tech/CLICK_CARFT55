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
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "CORS preflight" }),
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

    const apiKey =
      process.env.GOOGLE_TTS_API_KEY ||
      process.env.GOOGLE_CLOUD_API_KEY ||
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error:
            "Google Cloud TTS API key is not configured. Set GOOGLE_TTS_API_KEY in environment variables.",
        }),
      };
    }

    // Call Google Cloud Text-to-Speech REST API with hi-IN-Wavenet-A
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
            languageCode: "hi-IN",
            name: "hi-IN-Wavenet-A",
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: 0.95,
            pitch: 0.0,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Google Cloud TTS Error]:", errorText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: "Failed to synthesize speech with Google Cloud TTS",
          details: errorText,
        }),
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        audioContent: data.audioContent,
      }),
    };
  } catch (error: any) {
    console.error("[TTS Serverless Function Error]:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error?.message || "Internal server error during speech synthesis.",
      }),
    };
  }
}
