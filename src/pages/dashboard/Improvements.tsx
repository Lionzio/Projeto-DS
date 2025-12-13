import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function Improvements() {
  const { user } = useAuth();
  const [improvements, setImprovements] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchImprovements();
    }
  }, [user]);

  const fetchImprovements = async () => {
    const { data } = await supabase
      .from('assessments')
      .select('areas_to_improve')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    const allAreas = data?.flatMap(a => (a.areas_to_improve as string[]) || []) || [];
    setImprovements([...new Set(allAreas)]);
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-accent" />
          <CardTitle className="text-2xl">Áreas a Desenvolver</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {improvements.length > 0 ? (
          <ul className="space-y-3">
            {improvements.map((area, i) => (
              <li key={i} className="flex gap-3 p-3 bg-accent/5 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-accent mt-2"></div>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center py-8">Faça uma avaliação para identificar áreas de melhoria</p>
        )}
      </CardContent>
    </Card>
  );
}
