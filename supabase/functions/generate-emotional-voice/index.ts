// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { text, voice } = await req.json();
    if (!text || !voice) {
      throw new Error("Missing 'text' or 'voice' in request body.");
    }

    const sanitizedText = text.replace(/"/g, '');

    const openAIApiKey = Deno.env.get("ChatGPT_ vozes");
    if (!openAIApiKey) {
      throw new Error("Server configuration error: OpenAI API key not found.");
    }

    const openAIResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        input: sanitizedText,
        voice: voice,
      }),
    });

    if (!openAIResponse.ok) {
      const errorBody = await openAIResponse.text();
      console.error("OpenAI API Error:", errorBody);
      // Throw an error that will be caught and returned as a JSON error object
      throw new Error(`OpenAI API Error (${openAIResponse.status}): ${errorBody}`);
    }

    // On success, return the audio blob
    const audioBlob = await openAIResponse.blob();
    return new Response(audioBlob, {
      headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' },
      status: 200,
    });

  } catch (error) {
    console.error("Edge Function Error:", error.message);
    // On failure, return a JSON error object with a 200 status
    // to bypass the Supabase client's generic error handling.
    return new Response(JSON.stringify({ 
      error: "An error occurred in the edge function.",
      details: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // IMPORTANT: Always return 200
    });
  }
})