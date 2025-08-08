import { useState } from 'react';
import { Upload, X, Wand2, Expand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageGenerationModal } from './ImageGenerationModal';

interface ImageUploaderProps {
  imagePreview?: string;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
  onViewImage: () => void;
  sceneId: string;
  characterImage?: File | null;
  characterImagePreview?: string | null;
  addDebugLog: (message: string) => void;
}

export const ImageUploader = ({ imagePreview, onImageUpload, onImageRemove, onViewImage, sceneId, characterImage, characterImagePreview, addDebugLog }: ImageUploaderProps) => {
  const inputId = `image-upload-${sceneId}`;
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="relative aspect-video w-full bg-muted/50 rounded-lg overflow-hidden group border border-dashed">
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImageUpload(file);
          }}
          className="hidden"
          id={inputId}
        />
        {!imagePreview ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-3">
            <button
              onClick={() => document.getElementById(inputId)?.click()}
              className="w-full flex-1 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted rounded-md transition-colors"
            >
              <Upload className="w-8 h-8 mb-2" />
              <span className="font-medium">Adicionar Imagem</span>
              <span className="text-xs">Clique ou arraste aqui</span>
            </button>
            <div className="w-full flex items-center gap-2">
              <hr className="flex-grow border-border" />
              <span className="text-xs text-muted-foreground">OU</span>
              <hr className="flex-grow border-border" />
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsModalOpen(true)}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Gerar com IA
            </Button>
          </div>
        ) : (
          <>
            <img src={imagePreview} alt="Preview da cena" className="w-full h-full object-cover" crossOrigin="anonymous" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={onViewImage}
                title="Visualizar imagem"
              >
                <Expand className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => document.getElementById(inputId)?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Trocar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={onImageRemove}
              >
                <X className="w-4 h-4 mr-2" />
                Remover
              </Button>
            </div>
          </>
        )}
      </div>
      <ImageGenerationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImageGenerated={onImageUpload}
        characterImage={characterImage}
        characterImagePreview={characterImagePreview}
        addDebugLog={addDebugLog}
      />
    </>
  );
};