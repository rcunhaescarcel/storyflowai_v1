import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Scene } from '@/hooks/useFFmpeg';

interface StoryGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryGenerated: (scenes: Scene[]) => void;
  addDebugLog: (message: string) => void;
}

export const StoryGeneratorModal = ({ isOpen, onClose, onStoryGenerated, addDebugLog }: StoryGeneratorModalProps) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateStory = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor, insira um tema para a história.");
      return;
    }
    setIsLoading(true);
    addDebugLog(`[História IA] Iniciando geração para o prompt: "${prompt}"`);

    try {
      const storyPrompt = `Gere uma história curta e envolvente para um vídeo, baseada no seguinte tema: "${prompt}". A história deve ser dividida em parágrafos curtos, onde cada parágrafo representa uma cena do vídeo.`;
      const encodedPrompt = encodeURIComponent(storyPrompt);
      const apiToken = "76b4jfL5SsXI48nS";
      const referrer = "https://vidflow.com.br/";
      // O modelo 'gpt-2' não foi encontrado. Removendo o parâmetro do modelo para usar o padrão da API.
      const targetUrl = `https://text.pollinations.ai/${encodedPrompt}?token=${apiToken}&referrer=${referrer}`;

      addDebugLog(`[História IA] URL da API: ${targetUrl.substring(0, 100)}...`);

      const response = await fetch(targetUrl);

      if (!response.ok) {
        const errorBody = await response.text();
        addDebugLog(`[História IA] ❌ ERRO na API: ${errorBody}`);
        throw new Error(`A geração de texto falhou com o status: ${response.status}`);
      }

      const storyText = await response.text();
      addDebugLog(`[História IA] ✅ Texto recebido da IA.`);

      const paragraphs = storyText.trim().split('\n').filter(p => p.trim() !== '');
      
      if (paragraphs.length === 0) {
        addDebugLog(`[História IA] ⚠️ A IA não retornou parágrafos válidos.`);
        toast.warning("A IA não conseguiu gerar uma história. Tente um prompt diferente.");
        return;
      }

      const newScenes: Scene[] = paragraphs.map(paragraph => ({
        id: crypto.randomUUID(),
        narrationText: paragraph.trim(),
        effect: "fade",
        zoomEnabled: false,
        zoomIntensity: 20,
        zoomDirection: "in",
        fadeInDuration: 0.5,
        fadeOutDuration: 0.5,
      }));

      onStoryGenerated(newScenes);
      toast.success("História e cenas geradas com sucesso!");
      onClose();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      addDebugLog(`[História IA] ❌ Falha na geração: ${errorMessage}`);
      toast.error(`Falha ao gerar a história: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Gerar História com IA
          </DialogTitle>
          <DialogDescription>
            Descreva o tema da sua história. A IA irá criar o roteiro e dividir em cenas para você.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            id="story-prompt"
            placeholder="Ex: A jornada de um pequeno robô que se perdeu na cidade grande e tenta encontrar o caminho de volta para casa."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            rows={5}
            className="bg-background"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleGenerateStory} disabled={isLoading || !prompt.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              "Gerar História"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};