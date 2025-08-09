// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Pré-flight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Use POST." }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { text, voice = "alloy" } = await req.json().catch(() => ({}));
    if (!text || !voice) {
      return new Response(JSON.stringify({ error: "Parâmetros 'text' e 'voice' são obrigatórios." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sanitizedText = String(text).replace(/"/g, "");

    // Usando a nova variável de ambiente sem espaços
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY não configurada no Supabase." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openAIResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        input: sanitizedText,
        voice,
        response_format: "mp3",
      }),
    });

    if (!openAIResponse.ok) {
      const errorBody = await openAIResponse.text().catch(() => "");
      console.error("Erro da API OpenAI:", openAIResponse.status, errorBody);
      return new Response(
        JSON.stringify({ error: "Erro na OpenAI", status: openAIResponse.status, details: errorBody }),
        { status: openAIResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Pipe de streaming direto (menos memória, mais rápido)
    return new Response(openAIResponse.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (err) {
    console.error("Erro na Edge Function:", err);
    return new Response(JSON.stringify({ error: "Falha interna", details: String(err?.message ?? err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});