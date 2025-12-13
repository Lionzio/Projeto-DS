import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";

export default function Strengths() {
  const { user } = useAuth();
  const [strengths, setStrengths] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchStrengths();
    }
  }, [user]);

  const fetchStrengths = async () => {
    const { data } = await supabase
      .from('assessments')
      .select('strengths')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    const allStrengths = data?.flatMap(a => (a.strengths as string[]) || []) || [];
    setStrengths([...new Set(allStrengths)]);
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-[hsl(var(--success))]" />
          <CardTitle className="text-2xl">Meus Pontos Fortes</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {strengths.length > 0 ? (
          <ul className="space-y-3">
            {strengths.map((s, i) => (
              <li key={i} className="flex gap-3 p-3 bg-[hsl(var(--success))]/5 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--success))] mt-2"></div>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center py-8">Faça uma avaliação para descobrir seus pontos fortes</p>
        )}
      </CardContent>
    </Card>
  );
}
