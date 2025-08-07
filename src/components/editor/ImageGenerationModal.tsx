import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageGenerated: (file: File) => void;
}

export const ImageGenerationModal = ({ isOpen, onClose, onImageGenerated }: ImageGenerationModalProps) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor, insira uma descrição para a imagem.");
      return;
    }
    setIsLoading(true);
    try {
      // Usando a API Pollinations para gerar a imagem a partir do prompt
      const encodedPrompt = encodeURIComponent(prompt);
      const response = await fetch(`https://image.pollinations.ai/prompt/${encodedPrompt}`);

      if (!response.ok) {
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
      toast.error("Falha ao gerar a imagem. Tente um prompt diferente ou tente novamente mais tarde.");
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
          <Input
            id="prompt"
            placeholder="Ex: um astronauta fofo em um cavalo, estilo aquarela"
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