import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageUploaderProps {
  imagePreview?: string;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
  sceneId: string;
}

export const ImageUploader = ({ imagePreview, onImageUpload, onImageRemove, sceneId }: ImageUploaderProps) => {
  const inputId = `image-upload-${sceneId}`;

  return (
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
        <button
          onClick={() => document.getElementById(inputId)?.click()}
          className="w-full h-full flex flex-col items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
        >
          <ImageIcon className="w-10 h-10 mb-2" />
          <span className="font-medium">Adicionar Imagem</span>
        </button>
      ) : (
        <>
          <img src={imagePreview} alt="Preview da cena" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
  );
};