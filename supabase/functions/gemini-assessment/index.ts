// supabase/functions/gemini-assessment/index.ts
//
// This Edge Function implements analysis of the career questionnaire using
// Google's Gemini API. It follows the same structure as the existing
// analyze-assessment function, but it calls the Gemini REST API directly.
//
// The function expects a POST request with JSON body:
// { "type": "questionario", "content": "..." }
// where `content` contains all answers concatenated and labelled.
//
// It authenticates the caller via Supabase, validates the input, builds
// a prompt, and sends the request to the Gemini API. The Gemini API
// should return a JSON string describing the candidate's strengths,
// areas to improve, recommendations, readiness level, score and a
// motivational message. If the AI response cannot be parsed, an error
// will be returned.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Configure CORS so the Vite frontend can access this function.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define a schema for incoming payloads. We only accept the
// "questionario" type and a content string of reasonable length.
const requestSchema = z.object({
  type: z.literal("questionario"),
  content: z.string().trim().min(10).max(50_000),
});

// Build a pair of prompts to steer Gemini's output. The system prompt
// describes the persona and output format, while the user prompt
// contains the actual questionnaire answers. The strict JSON format
// ensures we receive machine parsable output.
function buildPrompts(content: string) {
  const systemPrompt =
    `Você é Nexo, um mentor de carreira especializado em preparar universitários e recém-formados para o primeiro emprego.\n\n` +
    `Analise as respostas do questionário e retorne apenas um JSON no seguinte formato:\n` +
    `{\n` +
    `  "pontos_fortes": ["<competência1>", "<competência2>", ...],\n` +
    `  "pontos_a_melhorar": ["<área1>", "<área2>", ...],\n` +
    `  "recomendacoes": ["<sugestão1>", "<sugestão2>", ...],\n` +
    `  "nivel": "iniciante" | "intermediario" | "pronto",\n` +
    `  "score": <0-100>,\n` +
    `  "mensagem_motivacional": "<mensagem de encorajamento>"\n` +
    `}\n\n` +
    `Seja específico, construtivo e termine com uma mensagem positiva.`;
  const userPrompt = `Analise estas respostas do questionário:\n\n${content}`;
  return { systemPrompt, userPrompt };
}

// Start the HTTP server. Supabase will invoke this handler for each
// request. We return JSON for all responses.
serve(async (req) => {
  // Handle CORS preflight requests.
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    // Authorize the caller. Supabase functions include the user's JWT
    // in the Authorization header. Without it we cannot identify the user.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Autenticação necessária" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create a Supabase client scoped to the authenticated user. We
    // specify the JWT in the global headers to ensure user context.
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("SUPABASE_URL e SUPABASE_ANON_KEY devem estar configurados");
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user is authenticated.
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Token inválido ou expirado" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Parse and validate the JSON body. A Zod schema ensures the
    // content is present and within size limits.
    const rawBody = await req.json();
    const validation = requestSchema.safeParse(rawBody);
    if (!validation.success) {
      const errs = validation.error.errors.map((e) => e.message).join(", ");
      return new Response(
        JSON.stringify({ error: `Validação falhou: ${errs}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    const { content } = validation.data;

    // Fetch the Gemini API key from environment variables. Without it
    // the request to Google will fail.
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY não configurada");
    }

    // Prepare prompts and the Gemini API request body. We embed both
    // prompts in a single part separated by two newlines. Gemini will
    // produce a response based on this conversation history.
    const { systemPrompt, userPrompt } = buildPrompts(content);
    const body = {
      contents: [
        {
          parts: [
            { text: systemPrompt + "\n\n" + userPrompt },
          ],
        },
      ],
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    const aiResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Handle non-successful responses gracefully. The Gemini API returns
    // 429 for rate limit and 402 for insufficient credits. We surface
    // these messages directly to the caller.
    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes para a API Gemini." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      // Log unexpected status codes for debugging.
      console.error("Gemini API error:", aiResponse.status);
      throw new Error("Erro ao processar com IA Gemini");
    }

    const data = await aiResponse.json();
    // Gemini returns an array of candidates. Each candidate contains a
    // content object with parts, where the text field holds the output.
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text ?? "";
    if (!text) {
      throw new Error("Resposta vazia da IA");
    }
    let result;
    try {
      result = JSON.parse(text);
    } catch (_) {
      console.error("Failed to parse Gemini response:", text);
      throw new Error("Erro ao interpretar a resposta da IA Gemini");
    }

    // Return the parsed analysis as JSON.
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    // Catch-all error handler for unexpected exceptions. Log the
    // error and return a 500 to the client.
    console.error("Error in gemini-assessment:", err);
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
