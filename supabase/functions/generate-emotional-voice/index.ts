// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const languageMap: { [key: string]: string } = {
  'pt-br': 'Português',
  'es-es': 'Espanhol',
  'en-us': 'Inglês'
};

const toneExamples: { [key: string]: string } = {
  'pt-br': 'Um tom extravagante e gentil.',
  'es-es': 'Un tono caprichoso y suave.',
  'en-us': 'A whimsical and gentle tone.'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { text, voice, tone: providedTone, language: languageKey = 'pt-br' } = await req.json();
    const openAIApiKey = Deno.env.get("ChatGPT_ vozes");

    if (!openAIApiKey) {
      throw new Error("OpenAI API key not found in environment variables.");
    }
    if (!text || !voice) {
      throw new Error("Missing 'text' or 'voice' in request body.");
    }

    let finalTone = providedTone;
    const languageName = languageMap[languageKey] || 'Português';
    const exampleTone = toneExamples[languageKey] || toneExamples['pt-br'];

    // Se nenhum tom for fornecido, gere um
    if (!finalTone) {
      const toneResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAIApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{
            role: "user",
            content: `Determine o melhor tom de voz para o seguinte texto. Responda com apenas uma frase curta no idioma ${languageName} (por exemplo, "${exampleTone}"). Texto: "${text}"`
          }],
          temperature: 0.5,
          max_tokens: 20,
        }),
      });

      if (!toneResponse.ok) {
        const errorBody = await toneResponse.text();
        console.error("Error generating voice tone:", errorBody);
        throw new Error("Failed to generate voice tone from OpenAI.");
      }

      const toneData = await toneResponse.json();
      finalTone = toneData.choices[0].message.content.trim();
    }

    // Gere o áudio usando o modelo e a estrutura corretos
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
        instructions: finalTone,
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