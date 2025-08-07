import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, UserSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageGenerated: (file: File) => void;
  characterImage?: File | null;
  characterImagePreview?: string | null;
}

export const ImageGenerationModal = ({ isOpen, onClose, onImageGenerated, characterImage, characterImagePreview }: ImageGenerationModalProps) => {
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

    try {
      const encodedPrompt = encodeURIComponent(prompt);
      
      if (characterImage && useCharacter && characterImagePreview) {
        // Estrutura exata da URL que funciona para o modelo 'kontext'
        const model = 'kontext';
        const encodedImageURL = encodeURIComponent(characterImagePreview);
        const seed = Math.floor(Math.random() * 1000000);
        const width = 1280;
        const height = 720;
        const referrer = encodeURIComponent("https://vidflow.com.br/");
        
        targetUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&width=${width}&height=${height}&seed=${seed}&model=${model}&image=${encodedImageURL}&enhance=true&referrer=${referrer}&token=${apiToken}`;
        
      } else {
        // Usa o modelo 'flux' para geração padrão
        const model = 'flux';
        targetUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=${model}&token=${apiToken}`;
      }

      const response = await fetch(targetUrl);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("API Error:", errorBody);
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
      toast.error("Falha ao gerar a imagem. Verifique o console para mais detalhes.");
    } finally {
      setIsLoading(false);
      setPrompt('');
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