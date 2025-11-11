import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase-client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload as UploadIcon, FileText, Loader2 } from "lucide-react";

export default function Upload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({
          variant: "destructive",
          title: "Formato inválido",
          description: "Por favor, envie apenas arquivos PDF.",
        });
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB.",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // For MVP, we'll use a simple file reader approach
    // In production, you might want to use a library like pdf.js
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        
        // Simple text extraction - convert bytes to string
        // This is a simplified approach; real PDF parsing would be more complex
        let text = '';
        for (let i = 0; i < bytes.length; i++) {
          if (bytes[i] >= 32 && bytes[i] <= 126) {
            text += String.fromCharCode(bytes[i]);
          } else if (bytes[i] === 10 || bytes[i] === 13) {
            text += ' ';
          }
        }
        
        // Clean up the text
        text = text.replace(/\s+/g, ' ').trim();
        
        if (text.length < 100) {
          reject(new Error('Não foi possível extrair texto do PDF. Tente outro arquivo.'));
        } else {
          resolve(text.substring(0, 10000)); // Limit to first 10k chars
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        variant: "destructive",
        title: "Arquivo não selecionado",
        description: "Por favor, selecione um arquivo PDF.",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Extract text from PDF
      const extractedText = await extractTextFromPDF(file);

      // Call edge function for AI analysis
      const { data: analysisData, error: functionError } = await supabase.functions.invoke('analyze-assessment', {
        body: { type: 'curriculo', content: extractedText }
      });

      if (functionError) throw functionError;

      if (!analysisData) {
        throw new Error('Nenhum resultado retornado pela análise');
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('assessments')
        .insert({
          user_id: user!.id,
          type: 'curriculo',
          strengths: analysisData.pontos_fortes || [],
          areas_to_improve: analysisData.pontos_a_melhorar || [],
          recommendations: analysisData.recomendacoes || [],
          readiness_level: analysisData.nivel || 'iniciante',
          score: analysisData.score || 0,
          raw_data: { filename: file.name, analysis: analysisData }
        });

      if (dbError) throw dbError;

      toast({
        title: "Análise concluída!",
        description: analysisData.mensagem_motivacional || "Seu currículo foi analisado com sucesso.",
      });

      navigate('/dashboard/history');

    } catch (error: any) {
      console.error('Error uploading resume:', error);
      toast({
        variant: "destructive",
        title: "Erro ao processar",
        description: error.message || "Não foi possível analisar seu currículo. Tente novamente.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl">Upload de Currículo</CardTitle>
          <CardDescription>
            Envie seu currículo em PDF para receber uma análise detalhada e sugestões de melhoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors">
              <input
                type="file"
                id="file-upload"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                {file ? (
                  <>
                    <FileText className="w-16 h-16 text-primary" />
                    <div>
                      <p className="font-semibold text-lg">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm">
                      Escolher outro arquivo
                    </Button>
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-16 h-16 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-lg mb-1">
                        Clique para selecionar seu currículo
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Apenas arquivos PDF até 5MB
                      </p>
                    </div>
                  </>
                )}
              </label>
            </div>

            {file && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">O que será analisado:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Formatação e estrutura do currículo</li>
                  <li>• Experiências profissionais e acadêmicas</li>
                  <li>• Habilidades técnicas e comportamentais</li>
                  <li>• Clareza e objetividade das informações</li>
                  <li>• Adequação para primeiro emprego</li>
                </ul>
              </div>
            )}

            <Button 
              type="submit" 
              size="lg" 
              className="w-full"
              disabled={!file || isUploading}
              variant="hero"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analisando currículo...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-5 w-5" />
                  Enviar para Análise
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}