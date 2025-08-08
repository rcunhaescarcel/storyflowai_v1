import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, FileImage, FileAudio, Video, Loader2 } from "lucide-react";

export type DownloadSelection = {
  video: boolean;
  images: boolean;
  audio: boolean;
};

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (selection: DownloadSelection) => void;
  isDownloading: boolean;
  hasVideo: boolean;
  hasImages: boolean;
  hasAudios: boolean;
}

export const DownloadModal = ({
  isOpen,
  onClose,
  onDownload,
  isDownloading,
  hasVideo,
  hasImages,
  hasAudios,
}: DownloadModalProps) => {
  const [selection, setSelection] = useState<DownloadSelection>({
    video: true,
    images: false,
    audio: false,
  });

  const handleDownloadClick = () => {
    onDownload(selection);
  };

  const isAnythingSelected = selection.video || selection.images || selection.audio;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Opções de Download
          </DialogTitle>
          <DialogDescription>
            Selecione os arquivos que você deseja baixar.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center space-x-3 rounded-md border p-4">
            <Checkbox
              id="download-video"
              checked={selection.video}
              onCheckedChange={(checked) =>
                setSelection((s) => ({ ...s, video: !!checked }))
              }
              disabled={!hasVideo}
            />
            <Label htmlFor="download-video" className="flex items-center gap-3 font-normal cursor-pointer">
              <Video className="w-5 h-5" />
              Vídeo Final (.mp4)
            </Label>
          </div>
          <div className="flex items-center space-x-3 rounded-md border p-4">
            <Checkbox
              id="download-images"
              checked={selection.images}
              onCheckedChange={(checked) =>
                setSelection((s) => ({ ...s, images: !!checked }))
              }
              disabled={!hasImages}
            />
            <Label htmlFor="download-images" className="flex items-center gap-3 font-normal cursor-pointer">
              <FileImage className="w-5 h-5" />
              Imagens das Cenas (.zip)
            </Label>
          </div>
          <div className="flex items-center space-x-3 rounded-md border p-4">
            <Checkbox
              id="download-audio"
              checked={selection.audio}
              onCheckedChange={(checked) =>
                setSelection((s) => ({ ...s, audio: !!checked }))
              }
              disabled={!hasAudios}
            />
            <Label htmlFor="download-audio" className="flex items-center gap-3 font-normal cursor-pointer">
              <FileAudio className="w-5 h-5" />
              Narração Completa (.mp3)
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleDownloadClick}
            disabled={isDownloading || !isAnythingSelected}
            className="w-full"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isDownloading ? "Baixando..." : "Baixar Arquivos"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};