import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, FileText, Calendar, Award, TrendingUp, Lightbulb } from "lucide-react";

interface Assessment {
  id: string;
  type: string;
  readiness_level: string;
  score: number | null;
  strengths: string[];
  areas_to_improve: string[];
  recommendations: string[];
  created_at: string;
  raw_data: any;
}

export default function History() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  useEffect(() => {
    if (user) {
      fetchAssessments();
    }
  }, [user]);

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments(data as Assessment[] || []);
      if (data && data.length > 0) {
        setSelectedAssessment(data[0] as Assessment);
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReadinessColor = (level: string) => {
    switch (level) {
      case 'pronto': return 'bg-[hsl(var(--success))]';
      case 'intermediario': return 'bg-accent';
      case 'iniciante': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const getReadinessLabel = (level: string) => {
    switch (level) {
      case 'pronto': return 'Pronto para o Mercado';
      case 'intermediario': return 'Intermediário';
      case 'iniciante': return 'Iniciante';
      default: return level;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando histórico...</p>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <Card className="shadow-elegant">
        <CardContent className="py-12 text-center">
          <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhuma avaliação ainda</h3>
          <p className="text-muted-foreground mb-6">
            Comece respondendo o questionário ou fazendo upload do seu currículo
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild>
              <a href="/dashboard/questionnaire">Iniciar Questionário</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/dashboard/upload">Upload de Currículo</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Assessment List */}
      <div className="lg:col-span-1">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Minhas Avaliações</CardTitle>
            <CardDescription>{assessments.length} avaliações realizadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {assessments.map((assessment) => (
              <button
                key={assessment.id}
                onClick={() => setSelectedAssessment(assessment)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedAssessment?.id === assessment.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-accent/5'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {assessment.type === 'questionario' ? (
                    <MessageSquare className="w-5 h-5 text-primary" />
                  ) : (
                    <FileText className="w-5 h-5 text-accent" />
                  )}
                  <span className="font-medium">
                    {assessment.type === 'questionario' ? 'Questionário' : 'Currículo'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(assessment.created_at).toLocaleDateString('pt-BR')}
                </div>
                <div className="mt-2">
                  <Badge className={`${getReadinessColor(assessment.readiness_level)} text-white text-xs`}>
                    {getReadinessLabel(assessment.readiness_level)}
                  </Badge>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Assessment Details */}
      <div className="lg:col-span-2">
        {selectedAssessment && (
          <div className="space-y-6">
            {/* Header Card */}
            <Card className="shadow-elegant">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {selectedAssessment.type === 'questionario' ? 'Questionário' : 'Análise de Currículo'}
                    </CardTitle>
                    <CardDescription>
                      Realizado em {new Date(selectedAssessment.created_at).toLocaleString('pt-BR')}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getReadinessColor(selectedAssessment.readiness_level)} text-white mb-2`}>
                      {getReadinessLabel(selectedAssessment.readiness_level)}
                    </Badge>
                    {selectedAssessment.score && (
                      <div className="text-3xl font-bold text-primary">{selectedAssessment.score}%</div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Motivational Message */}
            {selectedAssessment.raw_data?.analysis?.mensagem_motivacional && (
              <Card className="shadow-card bg-gradient-to-r from-primary/5 to-accent/5">
                <CardContent className="pt-6">
                  <p className="text-foreground/90 italic">
                    "{selectedAssessment.raw_data.analysis.mensagem_motivacional}"
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Strengths */}
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[hsl(var(--success))]" />
                  <CardTitle>Pontos Fortes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {selectedAssessment.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))] mt-2"></div>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Areas to Improve */}
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <CardTitle>Áreas a Desenvolver</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {selectedAssessment.areas_to_improve.map((area, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent mt-2"></div>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  <CardTitle>Recomendações</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {selectedAssessment.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
