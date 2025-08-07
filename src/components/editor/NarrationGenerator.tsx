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
}

const openAIVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

export const NarrationGenerator = ({ narrationText, onTextChange, onAudioGenerated }: NarrationGeneratorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('alloy');

  const handleGenerateNarration = async () => {
    if (!narrationText || !narrationText.trim()) {
      toast.error("Por favor, insira o texto para a narração.");
      return;
    }
    setIsLoading(true);
    try {
      const encodedTextPrompt = encodeURIComponent(narrationText);
      const targetUrl = `https://audio.pollinations.ai/prompt/${encodedTextPrompt}?voice=${selectedVoice}&model=openai-audio&referrer=https://vidflow.com.br/`;

      const response = await fetch(targetUrl);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Error:", errorBody);
        throw new Error(`A geração de áudio falhou com o status: ${response.status}`);
      }

      const blob = await response.blob();
      const fileName = `narration_${selectedVoice}.mp3`;
      const file = new File([blob], fileName, { type: 'audio/mpeg' });

      onAudioGenerated(file);
      toast.success("Narração gerada com sucesso!");
    } catch (error) {
      console.error("Audio generation failed:", error);
      toast.error("Falha ao gerar a narração. Verifique o console para mais detalhes.");
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