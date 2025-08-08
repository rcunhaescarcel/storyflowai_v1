import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Scene } from '@/hooks/useFFmpeg';
import { Progress } from '@/components/ui/progress';

interface StoryGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryGenerated: (scenes: Scene[]) => void;
  addDebugLog: (message: string) => void;
}

const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const StoryGeneratorModal = ({ isOpen, onClose, onStoryGenerated, addDebugLog }: StoryGeneratorModalProps) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Gerando...');
  const [progress, setProgress] = useState(0);

  const handleGenerateStory = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor, insira um tema para a história.");
      return;
    }
    setIsLoading(true);
    setProgress(0);
    setLoadingMessage('Gerando roteiro da história...');
    addDebugLog(`[História IA] Iniciando geração para o prompt: "${prompt}"`);

    try {
      const storyPrompt = `Gere um roteiro para um vídeo de aproximadamente 60 segundos sobre o tema: "${prompt}". O roteiro deve ser dividido em cerca de 12 parágrafos. Para cada parágrafo (cena), forneça a narração em português e um prompt de imagem em inglês para gerar uma imagem no estilo de animação 3D. Use o formato: "Texto da narração. ||| English image prompt in 3D animation style." Não inclua títulos como "Cena 1".`;
      
      const encodedPrompt = encodeURIComponent(storyPrompt);
      const apiToken = "76b4jfL5SsXI48nS";
      const referrer = "https://vidflow.com.br/";
      const targetUrl = `https://text.pollinations.ai/${encodedPrompt}?token=${apiToken}&referrer=${referrer}`;

      addDebugLog(`[História IA] URL da API de texto: ${targetUrl.substring(0, 100)}...`);
      const response = await fetch(targetUrl);

      if (!response.ok) {
        const errorBody = await response.text();
        addDebugLog(`[História IA] ❌ ERRO na API de texto: ${errorBody}`);
        throw new Error(`A geração de texto falhou com o status: ${response.status}`);
      }

      const storyText = await response.text();
      addDebugLog(`[História IA] ✅ Texto recebido da IA.`);
      setProgress(5);

      const lines = storyText.trim().split('\n').filter(p => p.includes('|||'));
      
      if (lines.length === 0) {
        addDebugLog(`[História IA] ⚠️ A IA não retornou um roteiro no formato esperado.`);
        toast.warning("A IA não conseguiu gerar um roteiro válido. Tente um prompt diferente.");
        setIsLoading(false);
        return;
      }

      const scenesData = lines.map(line => {
        const parts = line.split('|||');
        return {
          narration: parts[0]?.trim() || '',
          imagePrompt: parts[1]?.trim() || ''
        };
      }).filter(data => data.narration && data.imagePrompt);

      const newScenes: Scene[] = [];
      const totalScenes = scenesData.length;
      const progressPerScene = 95 / totalScenes;

      for (let i = 0; i < totalScenes; i++) {
        const sceneData = scenesData[i];
        const baseProgress = 5 + (i * progressPerScene);

        // --- Image Generation ---
        setLoadingMessage(`Gerando imagem da cena ${i + 1}/${totalScenes}...`);
        addDebugLog(`[Imagem IA] Gerando para o prompt: "${sceneData.imagePrompt}"`);

        const encodedImagePrompt = encodeURIComponent(sceneData.imagePrompt);
        const imageModel = 'flux';
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedImagePrompt}?model=${imageModel}&token=${apiToken}&referrer=${referrer}&nologo=true`;

        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Falha ao gerar imagem para a cena ${i + 1}`);
        }

        const imageBlob = await imageResponse.blob();
        const imageFileName = `scene_${i + 1}.png`;
        const imageFile = new File([imageBlob], imageFileName, { type: 'image/png' });
        const imagePreview = await blobToDataURL(imageBlob);
        
        setProgress(baseProgress + progressPerScene / 2);

        // --- Audio Generation ---
        setLoadingMessage(`Gerando narração da cena ${i + 1}/${totalScenes}...`);
        addDebugLog(`[Áudio IA] Gerando para o texto: "${sceneData.narration.slice(0, 30)}..."`);

        const audioPrompt = `speak PT-BR: ${sceneData.narration}`;
        const encodedAudioPrompt = encodeURIComponent(audioPrompt);
        const audioUrl = `https://text.pollinations.ai/${encodedAudioPrompt}?model=openai-audio&voice=alloy&referrer=${referrer}&token=${apiToken}`;

        const audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) {
            throw new Error(`Falha ao gerar áudio para a cena ${i + 1}`);
        }

        const audioBlob = await audioResponse.blob();
        const audioFileName = `narration_${i + 1}.mp3`;
        const audioFile = new File([audioBlob], audioFileName, { type: 'audio/mpeg' });

        newScenes.push({
          id: crypto.randomUUID(),
          narrationText: sceneData.narration,
          image: imageFile,
          imagePreview: imagePreview,
          audio: audioFile,
          effect: "fade",
          zoomEnabled: false,
          zoomIntensity: 20,
          zoomDirection: "in",
          fadeInDuration: 0.5,
          fadeOutDuration: 0.5,
        });
        
        setProgress(baseProgress + progressPerScene);
      }

      onStoryGenerated(newScenes);
      toast.success("História, imagens e narrações geradas com sucesso!");
      onClose();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      addDebugLog(`[História IA] ❌ Falha na geração: ${errorMessage}`);
      toast.error(`Falha ao gerar a história, imagens ou áudios: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && isLoading) {
        setIsLoading(false);
        setProgress(0);
      }
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Gerar História com IA
          </DialogTitle>
          <DialogDescription>
            Descreva o tema da sua história. A IA irá criar o roteiro, as imagens e as narrações para cada cena.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 h-[138px]">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="w-full text-center">
                <p className="text-sm font-medium text-foreground">{loadingMessage}</p>
                <Progress value={progress} className="w-full mt-2" />
                <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% concluído</p>
              </div>
            </div>
          ) : (
            <Textarea
              id="story-prompt"
              placeholder="Ex: A jornada de um pequeno robô que se perdeu na cidade grande e tenta encontrar o caminho de volta para casa."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              rows={5}
              className="bg-background"
            />
          )}
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
              "Gerar História Completa"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};