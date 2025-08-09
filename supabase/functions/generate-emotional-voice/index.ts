// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const DEBUG = url.searchParams.get("debug") === "1";

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Use POST." }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const text = String(body?.text ?? "");
    const voice = String(body?.voice ?? "alloy");

    const diagnostics: Record<string, unknown> = {
      received: { textLen: text.length, voice },
    };

    if (!text || !voice) {
      return new Response(JSON.stringify({ error: "Parâmetros 'text' e 'voice' são obrigatórios.", ...diagnostics }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    diagnostics.envHasKey = Boolean(apiKey);

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY não configurada na Edge Function.", ...diagnostics }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sanitizedText = text.replace(/"/g, "");

    // Tentativa 1: tts-1 com "format"
    const tryOpenAI = async (model: string, payloadExtra: Record<string, unknown>) => {
      const payload = {
        model,
        input: sanitizedText,
        voice,
        ...payloadExtra, // format ou response_format
      };

      const r = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const ok = r.ok;
      const status = r.status;
      const headers = Object.fromEntries(r.headers.entries());

      if (!ok) {
        const textErr = await r.text().catch(() => "");
        return { ok, status, headers, errorText: textErr, body: null as any };
      }
      return { ok, status, headers, errorText: null, body: r.body as ReadableStream };
    };

    let attemptOrder = [
      { model: "tts-1", extra: { format: "mp3" }, label: "tts-1+format" },
      { model: "tts-1", extra: { response_format: "mp3" }, label: "tts-1+response_format" },
      { model: "gpt-4o-mini-tts", extra: { format: "mp3" }, label: "4o-mini-tts+format" },
      { model: "gpt-4o-mini-tts", extra: { response_format: "mp3" }, label: "4o-mini-tts+response_format" },
    ];

    for (const att of attemptOrder) {
      const res = await tryOpenAI(att.model, att.extra);
      if (DEBUG) {
        diagnostics[att.label] = { ok: res.ok, status: res.status, headers: res.headers, errorText: res.errorText };
      }
      if (res.ok && res.body) {
        // Sucesso
        return new Response(res.body, {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "audio/mpeg",
          },
        });
      }
    }

    // Se chegou aqui, falhou tudo
    if (DEBUG) {
      return new Response(JSON.stringify({ error: "Falha ao gerar áudio.", ...diagnostics }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Falha ao gerar áudio. Chame com ?debug=1 para detalhes." }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Falha interna", details: String(err?.message ?? err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});