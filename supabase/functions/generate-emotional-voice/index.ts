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
      throw new Error("Parâmetros 'text' ou 'voice' ausentes no corpo da requisição.");
    }

    const sanitizedText = text.replace(/"/g, '');

    // Usando a chave exata que o usuário mencionou.
    const openAIApiKey = Deno.env.get("ChatGPT_ vozes");
    if (!openAIApiKey) {
      throw new Error("Erro de configuração do servidor: Chave da API da OpenAI ('ChatGPT_ vozes') não encontrada. Verifique o nome e o valor da chave nas configurações do Supabase.");
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
      console.error("Erro da API OpenAI:", errorBody);
      throw new Error(`Erro da API OpenAI (${openAIResponse.status}): ${errorBody}`);
    }

    const audioBlob = await openAIResponse.blob();
    return new Response(audioBlob, {
      headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg' },
      status: 200,
    });

  } catch (error) {
    console.error("Erro na Edge Function:", error);
    return new Response(JSON.stringify({ 
      error: "Ocorreu um erro na edge function.",
      details: error.message,
      stack: error.stack,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
})