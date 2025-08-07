import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, UserSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageGenerated: (file: File) => void;
  characterImage?: File | null;
  characterImagePreview?: string | null;
  addDebugLog: (message: string) => void;
}

export const ImageGenerationModal = ({ isOpen, onClose, onImageGenerated, characterImage, characterImagePreview, addDebugLog }: ImageGenerationModalProps) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useCharacter, setUseCharacter] = useState(true);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor, insira uma descrição para a imagem.");
      return;
    }
    setIsLoading(true);

    let targetUrl = '';
    const apiToken = "76b4jfL5SsXI48nS";
    const referrer = "https://vidflow.com.br/";

    try {
      const encodedPrompt = encodeURIComponent(prompt);
      
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

        const model = 'kontext';
        const encodedImageURL = encodeURIComponent(publicUrl);
        const width = 1024;
        const height = 576;
        
        targetUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&image=${encodedImageURL}&token=${apiToken}&referrer=${referrer}`;
        
      } else {
        const model = 'flux';
        targetUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=${model}&token=${apiToken}&referrer=${referrer}`;
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

      onImageGenerated(file);
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            Gerar Imagem com IA
          </DialogTitle>
          <DialogDescription>
            Descreva a imagem que você quer criar. Seja detalhado para melhores resultados.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {characterImage && characterImagePreview && (
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="use-character" className="flex flex-col space-y-1">
                  <span className="font-medium flex items-center gap-2">
                    <UserSquare className="w-4 h-4" />
                    Usar Personagem de Referência
                  </span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Usa a imagem abaixo como base.
                  </span>
                </Label>
                <Switch
                  id="use-character"
                  checked={useCharacter}
                  onCheckedChange={setUseCharacter}
                />
              </div>
              {useCharacter && (
                <div className="flex items-center gap-4 mt-2">
                  <img src={characterImagePreview} alt="Character Preview" className="w-16 h-16 rounded-md object-cover" />
                  <p className="text-xs text-muted-foreground">
                    A imagem de referência será usada para guiar a IA.
                  </p>
                </div>
              )}
            </div>
          )}
          <Input
            id="prompt"
            placeholder="Ex: personagem em uma floresta mágica, noite"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
        </div>
        <DialogFooter>
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
              "Gerar Imagem"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};