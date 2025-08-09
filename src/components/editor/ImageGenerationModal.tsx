import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, UserSquare, Trash2, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Scene, VideoFormat } from '@/hooks/useFFmpeg';
import { cn } from '@/lib/utils';

interface ImageGenerationModalProps {
  scene: Scene | null;
  onClose: () => void;
  onImageGenerated: (sceneId: string, file: File, prompt: string) => void;
  onImageRemove: (sceneId: string) => void;
  characterImage?: File | null;
  characterImagePreview?: string | null;
  addDebugLog: (message: string) => void;
  videoFormat: VideoFormat;
}

export const ImageGenerationModal = ({ scene, onClose, onImageGenerated, onImageRemove, characterImage, characterImagePreview, addDebugLog, videoFormat }: ImageGenerationModalProps) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useCharacter, setUseCharacter] = useState(true);

  useEffect(() => {
    if (scene) {
      setPrompt(scene.imagePrompt || '');
    }
  }, [scene]);

  if (!scene) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor, insira uma descrição para a imagem.");
      return;
    }
    setIsLoading(true);

    let targetUrl = '';
    const apiToken = "76b4jfL5SsXI48nS";
    const referrer = "https://storyflow.app/";
    const isPortrait = videoFormat === 'portrait';
    const width = isPortrait ? 1080 : 1920;
    const height = isPortrait ? 1920 : 1080;

    try {
      const finalPrompt = (characterImage && useCharacter)
        ? `o personagem ${prompt}`
        : prompt;
      const encodedPrompt = encodeURIComponent(finalPrompt);
      
      if (characterImage && useCharacter) {
        addDebugLog('[IA] Fazendo upload da imagem de referência para o Supabase Storage...');
        
        const fileExt = characterImage.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('image-references')
          .upload(filePath, characterImage);

        if (uploadError) {
          addDebugLog(`[IA] ERRO no upload para o Supabase: ${uploadError.message}`);
          throw new Error(`Falha ao fazer upload da imagem de referência: ${uploadError.message}`);
        }
        addDebugLog('[IA] Upload concluído com sucesso.');

        const { data: urlData } = supabase.storage
          .from('image-references')
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
            addDebugLog('[IA] ERRO: Não foi possível obter a URL pública da imagem.');
            throw new Error('Não foi possível obter a URL pública da imagem.');
        }
        
        const publicUrl = urlData.publicUrl;
        addDebugLog(`[IA] URL pública obtida: ${publicUrl}`);

        try {
          addDebugLog(`[IA] Verificando acessibilidade da URL pública...`);
          const verificationResponse = await fetch(publicUrl);
          if (!verificationResponse.ok) {
            addDebugLog(`[IA] ❌ ERRO: A URL pública do personagem não está acessível (Status: ${verificationResponse.status}). Verifique as políticas do bucket 'image-references' no Supabase para permitir leitura pública.`);
            throw new Error('A URL da imagem de referência não está publicamente acessível.');
          }
          addDebugLog(`[IA] ✅ URL pública acessível.`);
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : "Erro desconhecido";
          addDebugLog(`[IA] ❌ ERRO ao verificar a URL pública: ${errorMessage}`);
          throw new Error(`Falha ao verificar a URL da imagem de referência: ${errorMessage}`);
        }

        const model = 'kontext';
        const encodedImageURL = encodeURIComponent(publicUrl);
        
        targetUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&image=${encodedImageURL}&token=${apiToken}&referrer=${referrer}&nologo=true`;
        
      } else {
        const model = 'flux';
        targetUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&token=${apiToken}&referrer=${referrer}&nologo=true`;
      }

      addDebugLog(`[IA] Gerando imagem com a URL: ${targetUrl.substring(0, 200)}...`);

      const response = await fetch(targetUrl);

      if (!response.ok) {
        const errorBody = await response.text();
        addDebugLog(`[IA] ERRO na API de imagem: ${errorBody}`);
        throw new Error(`A geração da imagem falhou com o status: ${response.status}`);
      }

      const blob = await response.blob();
      const fileName = `${prompt.slice(0, 30).replace(/\s/g, '_')}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      onImageGenerated(scene.id, file, prompt);
      toast.success("Imagem gerada com sucesso!");
      onClose();
    } catch (error) {
      console.error("Image generation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      toast.error(`Falha ao gerar a imagem: ${errorMessage}`);
      addDebugLog(`[IA] Falha na requisição: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    onImageRemove(scene.id);
    toast.success("Imagem removida da cena.");
    onClose();
  };

  const isPortrait = videoFormat === 'portrait';

  return (
    <Dialog open={!!scene} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(
        "sm:max-w-5xl",
        isPortrait && "sm:max-w-md"
      )}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {scene.image ? 'Editar Imagem da Cena' : 'Gerar Imagem para a Cena'}
          </DialogTitle>
          <DialogDescription>
            Descreva a imagem que você quer criar ou edite o prompt para gerar uma nova versão.
          </DialogDescription>
        </DialogHeader>
        
        {isPortrait ? (
          // Vertical Layout for Portrait
          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <Label>Pré-visualização</Label>
              <div className="rounded-lg overflow-hidden border bg-muted flex items-center justify-center aspect-[9/16]">
                {scene.imagePreview ? (
                  <img src={scene.imagePreview} alt="Imagem atual da cena" className="w-full h-full object-cover" crossOrigin="anonymous" />
                ) : (
                  <div className="text-center text-muted-foreground p-4">
                    <ImagePlus className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-sm">A imagem gerada aparecerá aqui.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {characterImage && characterImagePreview && (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <Label htmlFor="use-character" className="flex flex-col space-y-1">
                    <span className="font-medium flex items-center gap-2">
                      <UserSquare className="w-4 h-4" />
                      Usar Personagem
                    </span>
                  </Label>
                  <Switch
                    id="use-character"
                    checked={useCharacter}
                    onCheckedChange={setUseCharacter}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="prompt-v">Prompt da Imagem</Label>
                <Textarea
                  id="prompt-v"
                  placeholder="Ex: uma floresta mágica à noite, com uma lua brilhante, em estilo de animação 3D..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isLoading}
                  rows={5}
                  className="resize-none"
                />
              </div>
            </div>
          </div>
        ) : (
          // Horizontal Layout for Landscape
          <div className="grid md:grid-cols-3 gap-8 py-4">
            <div className="md:col-span-2 space-y-2">
              <Label>Pré-visualização</Label>
              <div className="rounded-lg overflow-hidden border bg-muted flex items-center justify-center aspect-video">
                {scene.imagePreview ? (
                  <img src={scene.imagePreview} alt="Imagem atual da cena" className="w-full h-full object-cover" crossOrigin="anonymous" />
                ) : (
                  <div className="text-center text-muted-foreground p-4">
                    <ImagePlus className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-sm">A imagem gerada aparecerá aqui.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-1 space-y-4">
              {characterImage && characterImagePreview && (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <Label htmlFor="use-character-h" className="flex flex-col space-y-1">
                    <span className="font-medium flex items-center gap-2">
                      <UserSquare className="w-4 h-4" />
                      Usar Personagem de Referência
                    </span>
                    <span className="font-normal leading-snug text-muted-foreground text-xs">
                      Usa a imagem do personagem como base.
                    </span>
                  </Label>
                  <Switch
                    id="use-character-h"
                    checked={useCharacter}
                    onCheckedChange={setUseCharacter}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="prompt-h">Prompt da Imagem</Label>
                <Textarea
                  id="prompt-h"
                  placeholder="Ex: uma floresta mágica à noite, com uma lua brilhante, em estilo de animação 3D..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isLoading}
                  rows={5}
                  className="resize-none"
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-between items-center pt-4 border-t">
          <div>
            {scene.image && (
              <Button type="button" variant="destructive" onClick={handleRemove} disabled={isLoading}>
                <Trash2 className="mr-2 h-4 w-4" />
                Remover Imagem
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {scene.image ? "Gerar Nova Imagem" : "Gerar Imagem"}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};