import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Target, TrendingUp, FileText, MessageSquare, Award } from "lucide-react";
import heroBackground from "@/assets/hero-background.png";
import nexoAvatar from "@/assets/nexo-avatar.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(215, 235, 255, 0.3), rgba(255, 255, 255, 0.95)), url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex justify-center mb-6">
              <img 
                src={nexoAvatar} 
                alt="Nexo - Seu Mentor Digital" 
                className="w-32 h-32 rounded-full shadow-elegant animate-fade-in"
              />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in">
              NexoCarreira
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground/80 animate-fade-in">
              Seu mentor digital para conquistar o <span className="font-semibold text-primary">primeiro emprego</span>
            </p>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in">
              Avaliações personalizadas com Inteligência Artificial para identificar seus pontos fortes, 
              desenvolver competências e te preparar para o mercado de trabalho
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button asChild size="xl" variant="hero">
                <Link to="/auth">Começar Agora</Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link to="/auth">Já tenho conta</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como funciona?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nexo utiliza IA avançada para analisar suas competências e te guiar rumo ao sucesso profissional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="shadow-card hover:shadow-elegant transition-all hover:scale-105">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Questionário Guiado</h3>
                <p className="text-muted-foreground">
                  Responda perguntas sobre suas experiências e receba feedback em tempo real
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elegant transition-all hover:scale-105">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Análise de Currículo</h3>
                <p className="text-muted-foreground">
                  Envie seu currículo em PDF e receba sugestões personalizadas de melhoria
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elegant transition-all hover:scale-105">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Pontos Fortes</h3>
                <p className="text-muted-foreground">
                  Descubra e potencialize suas melhores competências técnicas e comportamentais
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elegant transition-all hover:scale-105">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Áreas a Desenvolver</h3>
                <p className="text-muted-foreground">
                  Identifique gaps e receba recomendações práticas para evoluir
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elegant transition-all hover:scale-105">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Nível de Prontidão</h3>
                <p className="text-muted-foreground">
                  Avalie seu preparo atual: iniciante, intermediário ou pronto para o mercado
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elegant transition-all hover:scale-105">
              <CardContent className="pt-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Feedback Motivacional</h3>
                <p className="text-muted-foreground">
                  Receba orientações empáticas que reforçam sua autoconfiança
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Pronto para dar o próximo passo na sua carreira?
            </h2>
            <p className="text-lg text-muted-foreground">
              Junte-se a centenas de universitários que já descobriram seus pontos fortes e conquistaram seu primeiro emprego
            </p>
            <Button asChild size="xl" variant="hero">
              <Link to="/auth">Começar Minha Avaliação Gratuita</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 NexoCarreira. Powered by Lovable AI.</p>
        </div>
      </footer>
    </div>
  );
}
