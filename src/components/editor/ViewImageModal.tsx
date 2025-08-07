import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface ViewImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

export const ViewImageModal = ({ isOpen, onClose, imageUrl }: ViewImageModalProps) => {
  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-2 bg-transparent border-none shadow-none">
        <img src={imageUrl} alt="Visualização da Imagem" className="w-full h-auto rounded-lg" />
      </DialogContent>
    </Dialog>
  );
};