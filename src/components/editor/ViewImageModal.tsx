import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Visualização da Imagem</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <img src={imageUrl} alt="Visualização da Imagem" className="w-full h-auto rounded-lg" />
        </div>
      </DialogContent>
    </Dialog>
  );
};