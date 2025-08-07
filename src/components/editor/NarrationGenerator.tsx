import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface NarrationGeneratorProps {
  narrationText: string | undefined;
  onTextChange: (text: string) => void;
  onAudioGenerated: (file: File) => void;
  addDebugLog: (message: string) => void;
}

const openAIVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

export const NarrationGenerator = ({ narrationText, onTextChange, onAudioGenerated, addDebugLog }: NarrationGeneratorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('nova');

  const handleGenerateNarration = async () => {
    if (!narrationText || !narrationText.trim()) {
      toast.error("Por favor, insira o texto para a narração.");
      return;
    }
    setIsLoading(true);
    addDebugLog(`[Narração IA] Iniciando geração para o texto: "${narrationText.slice(0, 50)}..."`);
    try {
      const encodedTextPrompt = encodeURIComponent(narrationText);
      const token = "76b4jfL5SsXI48nS";
      const referrer = "https://vidflow.com.br/";
      
      const targetUrl = `https://text.pollinations.ai/${encodedTextPrompt}?model=openai-audio&voice=${selectedVoice}&referrer=${referrer}&token=${token}`;
      
      addDebugLog(`[Narração IA] URL da API: ${targetUrl.substring(0, 100)}...`);

      const response = await fetch(targetUrl);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Error:", errorBody);
        addDebugLog(`[Narração IA] ❌ ERRO na API: ${errorBody}`);
        throw new Error(`A geração de áudio falhou com o status: ${response.status}`);
      }

      const blob = await response.blob();
      const fileName = `narration_${selectedVoice}.mp3`;
      const file = new File([blob], fileName, { type: 'audio/mpeg' });

      onAudioGenerated(file);
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
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <Label className="text-xs text-muted-foreground">Voz (OpenAI)</Label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Selecione uma voz" />
            </SelectTrigger>
            <SelectContent>
              {openAIVoices.map(voice => (
                <SelectItem key={voice} value={voice} className="capitalize">{voice}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto">
          <Button onClick={handleGenerateNarration} disabled={isLoading || !narrationText?.trim()} className="w-full">
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
      </div>
    </div>
  );
};