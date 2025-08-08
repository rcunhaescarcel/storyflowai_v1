import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { resizeImage, dataURLtoFile, urlToFile } from "@/lib/imageUtils";
import { cn } from "@/lib/utils";

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File, preview: string) => void;
}

const galleryCharacters = [
  { name: "Robô Amigável", image: "https://placehold.co/300x300/a9d5e5/333?text=Rob%C3%B4" },
  { name: "Aventureira Corajosa", image: "https://placehold.co/300x300/f0b8b8/333?text=Aventureira" },
  { name: "Mago Sábio", image: "https://placehold.co/300x300/c8a2c8/333?text=Mago" },
  { name: "Criatura da Floresta", image: "https://placehold.co/300x300/b8d8b8/333?text=Criatura" },
];

export const CharacterModal = ({ isOpen, onClose, onConfirm }: CharacterModalProps) => {
  const [selected, setSelected] = useState<{ file: File | null; preview: string | null }>({ file: null, preview: null });
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        const resizedPreview = await resizeImage(file, 512, 512);
        const resizedFile = dataURLtoFile(resizedPreview, file.name);
        setSelected({ file: resizedFile, preview: resizedPreview });
      } catch (error) {
        toast.error("Falha ao processar a imagem.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGallerySelect = async (character: typeof galleryCharacters[0]) => {
    setIsLoading(true);
    try {
      const file = await urlToFile(character.image, `${character.name}.png`);
      const resizedPreview = await resizeImage(file, 512, 512);
      const resizedFile = dataURLtoFile(resizedPreview, file.name);
      setSelected({ file: resizedFile, preview: resizedPreview });
    } catch (error) {
      toast.error("Falha ao carregar personagem da galeria.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmClick = () => {
    if (selected.file && selected.preview) {
      onConfirm(selected.file, selected.preview);
      onClose();
    } else {
      toast.warning("Nenhum personagem selecionado.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Escolher Personagem de Referência</DialogTitle>
          <DialogDescription>
            Use um personagem para manter a consistência visual em todas as cenas.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gallery">Galeria</TabsTrigger>
            <TabsTrigger value="upload">Fazer Upload</TabsTrigger>
          </TabsList>
          <TabsContent value="gallery">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 max-h-80 overflow-y-auto">
              {galleryCharacters.map((char) => (
                <div
                  key={char.name}
                  className={cn(
                    "relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                    selected.preview === char.image ? "border-primary" : "border-transparent"
                  )}
                  onClick={() => handleGallerySelect(char)}
                >
                  <img src={char.image} alt={char.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  <p className="absolute bottom-2 left-2 text-white text-sm font-bold">{char.name}</p>
                  {selected.preview === char.image && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="upload">
            <div className="py-4 flex flex-col items-center justify-center gap-4">
              <Label
                htmlFor="character-upload-modal"
                className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                ) : selected.preview ? (
                  <img src={selected.preview} alt="Preview" className="max-h-full rounded-md" />
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-muted-foreground" />
                    <span className="mt-2 text-sm font-medium">Clique para fazer upload</span>
                    <span className="text-xs text-muted-foreground">PNG ou JPG (max 512x512)</span>
                  </>
                )}
              </Label>
              <Input id="character-upload-modal" type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirmClick} disabled={!selected.file || isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Confirmar Personagem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};