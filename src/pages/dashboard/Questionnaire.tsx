import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase-client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";

const questions = [
  {
    id: 'experiencia',
    label: 'Experiência Profissional',
    question: 'Descreva sua experiência profissional, estágios ou trabalhos voluntários (se tiver):',
    placeholder: 'Ex: Estágio em marketing digital por 6 meses, ajudei nas redes sociais...',
  },
  {
    id: 'habilidades_tecnicas',
    label: 'Habilidades Técnicas',
    question: 'Quais são suas principais habilidades técnicas? (ferramentas, softwares, idiomas)',
    placeholder: 'Ex: Excel intermediário, Inglês fluente, Photoshop básico...',
  },
  {
    id: 'soft_skills',
    label: 'Competências Comportamentais',
    question: 'Como você descreveria suas principais competências comportamentais?',
    placeholder: 'Ex: Boa comunicação, trabalho em equipe, proatividade...',
  },
  {
    id: 'desafios',
    label: 'Desafios e Aprendizados',
    question: 'Conte sobre um desafio que você enfrentou e o que aprendeu com ele:',
    placeholder: 'Ex: Tive dificuldade com gestão de tempo, mas aprendi a usar técnicas de produtividade...',
  },
  {
    id: 'objetivos',
    label: 'Objetivos de Carreira',
    question: 'Quais são seus objetivos profissionais para os próximos 2 anos?',
    placeholder: 'Ex: Conseguir meu primeiro emprego na área de TI e desenvolver habilidades em programação...',
  },
];

export default function Questionnaire() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all questions are answered
    const unanswered = questions.filter(q => !answers[q.id]?.trim());
    if (unanswered.length > 0) {
      toast({
        variant: "destructive",
        title: "Responda todas as perguntas",
        description: "Por favor, preencha todos os campos antes de enviar.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format answers for AI
      const formattedContent = questions.map(q => 
        `${q.label}:\n${answers[q.id]}`
      ).join('\n\n');

      // Call the Supabase edge function backed by Gemini for AI analysis.
      // This function resides in `supabase/functions/gemini-assessment/index.ts` and
      // will forward the request to the Google Gemini API. It expects a
      // `questionario` type and a `content` string with the formatted answers.
      const { data: analysisData, error: functionError } = await supabase.functions.invoke('gemini-assessment', {
        body: { type: 'questionario', content: formattedContent }
      });

      // Surface any errors returned by the function.
      if (functionError) throw functionError;

      if (!analysisData) {
        throw new Error('Nenhum resultado retornado pela análise');
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('assessments')
        .insert({
          user_id: user!.id,
          type: 'questionario',
          strengths: analysisData.pontos_fortes || [],
          areas_to_improve: analysisData.pontos_a_melhorar || [],
          recommendations: analysisData.recomendacoes || [],
          readiness_level: analysisData.nivel || 'iniciante',
          score: analysisData.score || 0,
          raw_data: { answers, analysis: analysisData }
        });

      if (dbError) throw dbError;

      toast({
        title: "Análise concluída!",
        description: analysisData.mensagem_motivacional || "Seu questionário foi analisado com sucesso.",
      });

      navigate('/dashboard/history');

    } catch (error: any) {
      console.error('Error submitting questionnaire:', error);
      toast({
        variant: "destructive",
        title: "Erro ao processar",
        description: error.message || "Não foi possível processar sua análise. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl">Questionário de Avaliação</CardTitle>
          <CardDescription>
            Responda com sinceridade para receber uma análise personalizada de suas competências
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((q, index) => (
              <div key={q.id} className="space-y-3">
                <Label htmlFor={q.id} className="text-base font-semibold">
                  {index + 1}. {q.question}
                </Label>
                <Textarea
                  id={q.id}
                  placeholder={q.placeholder}
                  value={answers[q.id] || ''}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  rows={4}
                  className="resize-none"
                  disabled={isSubmitting}
                />
              </div>
            ))}

            <div className="pt-4">
              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                disabled={isSubmitting}
                variant="hero"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analisando suas respostas...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Enviar para Análise
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
