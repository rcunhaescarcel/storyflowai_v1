// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // 2. Get request body
    const { text, voice } = await req.json();
    if (!text || !voice) {
      return new Response("Missing 'text' or 'voice' in request body.", { status: 400, headers: corsHeaders });
    }

    // 3. Get API key
    const openAIApiKey = Deno.env.get("ChatGPT_ vozes");
    if (!openAIApiKey) {
      console.error("CRITICAL: OpenAI API key secret 'ChatGPT_ vozes' not found.");
      return new Response("Server configuration error: API key not found.", { status: 500, headers: corsHeaders });
    }

    // 4. Call OpenAI API
    const openAIResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: voice,
      }),
    });

    // 5. Handle OpenAI response
    if (!openAIResponse.ok) {
      const errorBody = await openAIResponse.text();
      console.error("OpenAI API Error:", errorBody);
      // Forward the error from OpenAI to the client for better debugging
      return new Response(`OpenAI API error: ${errorBody}`, { status: openAIResponse.status, headers: corsHeaders });
    }

    // 6. Stream the audio back to the client
    const audioBlob = await openAIResponse.blob();
    return new Response(audioBlob, {
      headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' },
      status: 200,
    });

  } catch (error) {
    console.error("Edge Function Error:", error);
    return new Response(`Internal Server Error: ${error.message}`, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})