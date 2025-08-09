// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const runDebugTests = async (apiKey, text) => {
  const logs = [];
  const models = ["tts-1", "tts-1-hd"];
  const voices = ["alloy", "nova"];
  let success = false;

  logs.push("--- Iniciando Modo de Depuração de Áudio ---");
  logs.push(`Texto para teste: "${text.slice(0, 50)}..."`);

  for (const model of models) {
    for (const voice of voices) {
      const payload = { model, input: text, voice, response_format: "mp3" };
      logs.push(`[TESTE] Modelo: ${model}, Voz: ${voice}`);
      try {
        const response = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          logs.push(`  [SUCESSO] Resposta OK (Status: ${response.status}). A API está funcionando com esta configuração.`);
          // Consumir o corpo para evitar vazamentos de recursos, mesmo que não o usemos.
          await response.arrayBuffer();
          success = true;
        } else {
          const errorText = await response.text();
          logs.push(`  [FALHA] Resposta com erro (Status: ${response.status}). Detalhes: ${errorText.slice(0, 150)}`);
        }
      } catch (e) {
        logs.push(`  [FALHA CRÍTICA] Erro na requisição fetch: ${e.message}`);
      }
    }
  }

  logs.push("--- Fim do Modo de Depuração ---");
  return { logs, success };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const text = String(body?.text ?? "");
    const voice = String(body?.voice ?? "alloy");
    const isDebugMode = !!body?.debug;

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY não configurada." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (isDebugMode) {
      const { logs, success } = await runDebugTests(apiKey, text);
      return new Response(JSON.stringify({ debug_logs: logs, success }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!text || !voice) {
      return new Response(JSON.stringify({ error: "Parâmetros 'text' e 'voice' são obrigatórios." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sanitizedText = text.replace(/"/g, "");
    const payload = { model: "tts-1", input: sanitizedText, voice, response_format: "mp3" };

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: "Falha ao gerar áudio na API da OpenAI.", details: errorText }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "audio/mpeg" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Falha interna", details: String(err?.message ?? err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});