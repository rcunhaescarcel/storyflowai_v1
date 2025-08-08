// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Temporariamente removido 'tone' e 'language'. Apenas texto e voz são necessários.
    const { text, voice } = await req.json();
    const openAIApiKey = Deno.env.get("ChatGPT_ vozes");

    if (!openAIApiKey) {
      throw new Error("OpenAI API key not found in environment variables.");
    }
    if (!text || !voice) {
      throw new Error("Missing 'text' or 'voice' in request body.");
    }

    // Gere o áudio sem o campo 'instructions' para depuração.
    const audioResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        input: text,
        voice: voice,
      }),
    });

    if (!audioResponse.ok) {
      const errorBody = await audioResponse.text();
      console.error("Error generating audio:", errorBody);
      throw new Error(`Failed to generate audio from OpenAI: ${errorBody}`);
    }

    const audioBlob = await audioResponse.blob();

    return new Response(audioBlob, {
      headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})