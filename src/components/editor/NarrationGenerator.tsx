import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { blobToDataURL } from '@/lib/imageUtils';

interface NarrationGeneratorProps {
  narrationText: string | undefined;
  onTextChange: (text: string) => void;
  onAudioGenerated: (file: File, dataUrl: string) => void;
  addDebugLog: (message: string) => void;
  audio?: File;
  duration?: number;
  onAudioRemove: () => void;
}

export const NarrationGenerator = ({ narrationText, onTextChange, onAudioGenerated, addDebugLog, audio, duration, onAudioRemove }: NarrationGeneratorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (audio) {
      const url = URL.createObjectURL(audio);
      setAudioUrl(url);

      return () => {
        URL.revokeObjectURL(url);
        setAudioUrl(null);
      };
    } else {
      setAudioUrl(null);
    }
  }, [audio]);

  const handleGenerateNarration = async () => {
    if (!narrationText || !narrationText.trim()) {
      toast.error("Por favor, insira o texto para a narração.");
      return;
    }
    setIsLoading(true);
    addDebugLog(`[Narração IA] Iniciando geração para o texto: "${narrationText.slice(0, 50)}..."`);
    try {
      const audioPrompt = `speak PT-BR: ${narrationText}`;
      const encodedTextPrompt = encodeURIComponent(audioPrompt);
      const token = "76b4jfL5SsXI48nS";
      const referrer = "https://vidflow.com.br/";
      
      const targetUrl = `https://text.pollinations.ai/${encodedTextPrompt}?model=openai-audio&voice=nova&referrer=${referrer}&token=${token}`;
      
      addDebugLog(`[Narração IA] URL da API: ${targetUrl.substring(0, 100)}...`);

      const response = await fetch(targetUrl);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Error:", errorBody);
        addDebugLog(`[Narração IA] ❌ ERRO na API: ${errorBody}`);
        throw new Error(`A geração de áudio falhou com o status: ${response.status}`);
      }

      const blob = await response.blob();
      const fileName = `narration_nova.mp3`;
      const file = new File([blob], fileName, { type: 'audio/mp3' });
      const dataUrl = await blobToDataURL(blob);

      onAudioGenerated(file, dataUrl);
      addDebugLog(`[Narração IA] ✅ Áudio gerado e carregado com sucesso!`);
      toast.success("Narração gerada com sucesso!");
    } catch (error) {
      console.error("Audio generation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      addDebugLog(`[Narração IA] ❌ Falha na geração: ${errorMessage}`);
      toast.error(`Falha ao gerar a narração: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div>
        <Label htmlFor="narration-text" className="text-sm font-medium">Texto para Narração (IA)</Label>
        <Textarea
          id="narration-text"
          placeholder="Digite o texto que a IA deve narrar para esta cena..."
          value={narrationText || ''}
          onChange={(e) => onTextChange(e.target.value)}
          className="mt-2 bg-background"
          rows={4}
        />
      </div>
      
      {audio && audioUrl ? (
        <div className="space-y-2 pt-2">
          <Label className="text-xs text-muted-foreground">Narração Gerada ({duration?.toFixed(1)}s)</Label>
          <div className="flex items-center gap-2">
            <audio src={audioUrl} controls className="h-10 w-full"></audio>
            <Button variant="ghost" size="icon" onClick={onAudioRemove} className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button onClick={handleGenerateNarration} disabled={isLoading || !narrationText?.trim()} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Narração
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};