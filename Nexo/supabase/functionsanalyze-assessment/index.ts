import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const requestSchema = z.object({
  type: z.enum(['questionario', 'curriculo'], {
    errorMap: () => ({ message: "Tipo deve ser 'questionario' ou 'curriculo'" })
  }),
  content: z.string()
    .trim()
    .min(10, { message: "Conteúdo muito curto (mínimo 10 caracteres)" })
    .max(50000, { message: "Conteúdo muito longo (máximo 50KB)" })
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Autenticação necessária' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido ou expirado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validationResult = requestSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => e.message).join(', ');
      return new Response(
        JSON.stringify({ error: `Validação falhou: ${errors}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { type, content } = validationResult.data;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'questionario') {
      systemPrompt = `Você é Nexo, um mentor de carreira especializado em preparar universitários e recém-formados para o primeiro emprego. Sua comunicação é formal mas levemente descontraída e sempre motivacional, reforçando a autoconfiança.

Analise as respostas do questionário e retorne um JSON estruturado com:
- pontos_fortes: array com 3-5 competências bem desenvolvidas (técnicas e comportamentais)
- pontos_a_melhorar: array com 3-5 áreas que precisam de desenvolvimento
- recomendacoes: array com 3-5 sugestões práticas e acionáveis
- nivel: "iniciante", "intermediario" ou "pronto"
- score: número de 0 a 100 representando o nível de prontidão
- mensagem_motivacional: uma mensagem personalizada de encorajamento

Seja específico, construtivo e sempre termine com reforço positivo.`;

      userPrompt = `Analise estas respostas do questionário:\n\n${content}`;
    } else if (type === 'curriculo') {
      systemPrompt = `Você é Nexo, um mentor de carreira especializado em análise de currículos para primeiro emprego. Seja formal mas acolhedor.

Analise o currículo e retorne um JSON estruturado com:
- pontos_fortes: array com elementos positivos do currículo
- pontos_a_melhorar: array com sugestões de melhoria
- recomendacoes: array com ações práticas para fortalecer o currículo
- nivel: "iniciante", "intermediario" ou "pronto"
- score: número de 0 a 100
- mensagem_motivacional: feedback personalizado

Foque em: formatação, experiências, habilidades técnicas, soft skills, educação.`;

      userPrompt = `Analise este currículo:\n\n${content}`;
    } else {
      throw new Error('Tipo de análise inválido');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Por favor, adicione créditos ao workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.error('AI Gateway error:', response.status);
      throw new Error('Erro ao processar com IA');
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;
    
    if (!aiContent) {
      throw new Error('Resposta inválida da IA');
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(aiContent);
    } catch (e) {
      console.error('Failed to parse AI response');
      throw new Error('Erro ao processar resposta da IA');
    }

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-assessment:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
