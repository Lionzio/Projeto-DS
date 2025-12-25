import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase-client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, FileText, Award, TrendingUp, Sparkles } from "lucide-react";

interface Assessment {
  id: string;
  type: string;
  readiness_level: string;
  score: number | null;
  created_at: string;
}

export default function Overview() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

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
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setAssessments(data || []);
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
      case 'pronto': return 'Pronto';
      case 'intermediario': return 'Intermediário';
      case 'iniciante': return 'Iniciante';
      default: return level;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-lg p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Bem-vindo ao NexoCarreira!</h2>
            <p className="text-muted-foreground mb-4">
              Estou aqui para te ajudar a descobrir seus pontos fortes e te preparar para conquistar o primeiro emprego. 
              Comece respondendo o questionário ou fazendo upload do seu currículo.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="hero">
                <Link to="/dashboard/questionnaire">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Iniciar Questionário
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/dashboard/upload">
                  <FileText className="w-4 h-4 mr-2" />
                  Upload de Currículo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Avaliações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{assessments.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Última Avaliação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {assessments[0] ? new Date(assessments[0].created_at).toLocaleDateString('pt-BR') : '-'}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nível Atual</CardTitle>
          </CardHeader>
          <CardContent>
            {assessments[0] ? (
              <Badge className={`${getReadinessColor(assessments[0].readiness_level)} text-white`}>
                {getReadinessLabel(assessments[0].readiness_level)}
              </Badge>
            ) : (
              <div className="text-muted-foreground">Sem avaliações</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Assessments */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Avaliações Recentes</CardTitle>
          <CardDescription>Suas últimas análises e relatórios</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : assessments.length > 0 ? (
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <div 
                  key={assessment.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${assessment.type === 'questionario' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                      {assessment.type === 'questionario' ? (
                        <MessageSquare className="w-5 h-5 text-primary" />
                      ) : (
                        <FileText className="w-5 h-5 text-accent" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {assessment.type === 'questionario' ? 'Questionário' : 'Análise de Currículo'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(assessment.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${getReadinessColor(assessment.readiness_level)} text-white`}>
                      {getReadinessLabel(assessment.readiness_level)}
                    </Badge>
                    {assessment.score && (
                      <div className="text-lg font-semibold">{assessment.score}%</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                Você ainda não tem avaliações. Comece agora!
              </div>
              <div className="flex gap-3 justify-center">
                <Button asChild variant="default">
                  <Link to="/dashboard/questionnaire">Iniciar Questionário</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/dashboard/upload">Upload de Currículo</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-card hover:shadow-elegant transition-all cursor-pointer">
          <Link to="/dashboard/strengths">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[hsl(var(--success))]/10 rounded-lg">
                  <Award className="w-6 h-6 text-[hsl(var(--success))]" />
                </div>
                <div>
                  <CardTitle>Meus Pontos Fortes</CardTitle>
                  <CardDescription>Veja suas melhores competências</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>

        <Card className="shadow-card hover:shadow-elegant transition-all cursor-pointer">
          <Link to="/dashboard/improvements">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <CardTitle>Áreas a Desenvolver</CardTitle>
                  <CardDescription>Oportunidades de crescimento</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  );
}