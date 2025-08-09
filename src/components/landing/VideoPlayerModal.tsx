import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface VideoPlayerModalProps {
  videoUrl: string | null;
  onClose: () => void;
}

export const VideoPlayerModal = ({ videoUrl, onClose }: VideoPlayerModalProps) => {
  if (!videoUrl) return null;

  return (
    <Dialog open={!!videoUrl} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl p-0 border-0 bg-transparent shadow-none">
        <AspectRatio ratio={16 / 9}>
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full rounded-lg bg-black"
            onEnded={onClose}
          />
        </AspectRatio>
      </DialogContent>
    </Dialog>
  );
};