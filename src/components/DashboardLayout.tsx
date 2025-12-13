import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Home, MessageSquare, TrendingUp, Award, History } from "lucide-react";
import nexoAvatar from "@/assets/nexo-avatar.png";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const currentTab = location.pathname.split('/').pop() || 'overview';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={nexoAvatar} alt="Nexo" className="w-10 h-10 rounded-full" />
              <div>
                <h1 className="text-xl font-bold">NexoCarreira</h1>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.email ? getInitials(user.email) : 'U'}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b bg-card/30">
        <div className="container mx-auto px-4">
          <Tabs value={currentTab} className="w-full">
            <TabsList className="h-auto p-0 bg-transparent border-0 flex-wrap justify-start">
              <TabsTrigger 
                value="overview" 
                asChild
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Link to="/dashboard" className="flex items-center gap-2 px-4 py-3">
                  <Home className="h-4 w-4" />
                  Visão Geral
                </Link>
              </TabsTrigger>
              
              <TabsTrigger 
                value="questionnaire" 
                asChild
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Link to="/dashboard/questionnaire" className="flex items-center gap-2 px-4 py-3">
                  <MessageSquare className="h-4 w-4" />
                  Questionário
                </Link>
              </TabsTrigger>
              
              <TabsTrigger 
                value="history"
                asChild
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Link to="/dashboard/history" className="flex items-center gap-2 px-4 py-3">
                  <History className="h-4 w-4" />
                  Histórico
                </Link>
              </TabsTrigger>
              
              <TabsTrigger 
                value="strengths" 
                asChild
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Link to="/dashboard/strengths" className="flex items-center gap-2 px-4 py-3">
                  <Award className="h-4 w-4" />
                  Pontos Fortes
                </Link>
              </TabsTrigger>
              
              <TabsTrigger 
                value="improvements" 
                asChild
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <Link to="/dashboard/improvements" className="flex items-center gap-2 px-4 py-3">
                  <TrendingUp className="h-4 w-4" />
                  A Desenvolver
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
