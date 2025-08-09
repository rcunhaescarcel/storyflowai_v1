import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, UserSquare, Trash2, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Scene, VideoFormat } from '@/hooks/useFFmpeg';
import { cn } from '@/lib/utils';
import { generateImage } from '@/lib/api';

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

export const ImageGenerationModal = ({ scene, onClose, onImageGenerated, onImageRemove, characterImage, addDebugLog, videoFormat }: ImageGenerationModalProps) => {
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
    setIsLoading(true);
    try {
      const result = await generateImage({
        prompt,
        characterImage,
        videoFormat,
        useCharacter,
        addDebugLog,
      });

      if (result) {
        onImageGenerated(scene.id, result.file, result.prompt);
        toast.success("Imagem gerada com sucesso!");
        onClose();
      }
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
        isPortrait && "sm:max-w-3xl"
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
        
        <div className="grid md:grid-cols-2 gap-8 py-4">
          <div className="space-y-2">
            <Label>Pré-visualização</Label>
            <div className={cn(
              "rounded-lg overflow-hidden border bg-muted flex items-center justify-center",
              isPortrait ? "aspect-[9/16]" : "aspect-video"
            )}>
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

          <div className="space-y-4 flex flex-col">
            {characterImage && (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <Label htmlFor="use-character" className="flex flex-col space-y-1">
                  <span className="font-medium flex items-center gap-2">
                    <UserSquare className="w-4 h-4" />
                    Usar Personagem de Referência
                  </span>
                  <span className="font-normal leading-snug text-muted-foreground text-xs">
                    Usa a imagem do personagem como base.
                  </span>
                </Label>
                <Switch
                  id="use-character"
                  checked={useCharacter}
                  onCheckedChange={setUseCharacter}
                />
              </div>
            )}
            <div className="space-y-2 flex-1 flex flex-col">
              <Label htmlFor="prompt">Prompt da Imagem</Label>
              <Textarea
                id="prompt"
                placeholder="Ex: uma floresta mágica à noite, com uma lua brilhante, em estilo de animação 3D..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
                className="resize-none flex-1"
              />
            </div>
          </div>
        </div>

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