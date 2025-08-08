import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Scene } from "@/hooks/useFFmpeg";
import { Download, FileImage, FileAudio, FileArchive, Video, Loader2 } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "sonner";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: Scene[];
  videoUrl: string | null;
  projectTitle: string;
}

export const DownloadModal = ({ isOpen, onClose, scenes, videoUrl, projectTitle }: DownloadModalProps) => {
  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadVideo = () => {
    if (videoUrl) {
      saveAs(videoUrl, `${projectTitle || 'video'}.mp4`);
    }
  };

  const handleDownloadAssets = async (type: 'images' | 'audios' | 'all') => {
    setIsZipping(true);
    const zip = new JSZip();
    const hasImages = scenes.some(s => s.image);
    const hasAudios = scenes.some(s => s.audio);

    try {
      if ((type === 'images' || type === 'all') && hasImages) {
        const imagesFolder = zip.folder("images");
        if (imagesFolder) {
          for (let i = 0; i < scenes.length; i++) {
            const scene = scenes[i];
            if (scene.image) {
              const fileExtension = scene.image.name.split('.').pop() || 'png';
              imagesFolder.file(`image_${i + 1}.${fileExtension}`, scene.image);
            }
          }
        }
      }

      if ((type === 'audios' || type === 'all') && hasAudios) {
        for (let i = 0; i < scenes.length; i++) {
          const scene = scenes[i];
          if (scene.audio) {
            const fileExtension = scene.audio.name.split('.').pop() || 'mp3';
            zip.file(`narration_${i + 1}.${fileExtension}`, scene.audio);
          }
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${projectTitle || 'projeto'}_${type}.zip`);
      toast.success("Download iniciado!");

    } catch (error) {
      console.error("Failed to create zip file", error);
      toast.error("Falha ao criar arquivo zip.");
    } finally {
      setIsZipping(false);
    }
  };

  const hasImages = scenes.some(s => s.image);
  const hasAudios = scenes.some(s => s.audio);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Opções de Download
          </DialogTitle>
          <DialogDescription>
            Escolha o que você deseja baixar do seu projeto.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <Button onClick={handleDownloadVideo} disabled={!videoUrl || isZipping} className="w-full justify-start gap-3">
            <Video className="w-5 h-5" />
            Baixar Vídeo Final (.mp4)
          </Button>
          <Button variant="outline" onClick={() => handleDownloadAssets('images')} disabled={!hasImages || isZipping} className="w-full justify-start gap-3">
            {isZipping && <Loader2 className="w-4 h-4 animate-spin" />}
            <FileImage className="w-5 h-5" />
            Baixar Apenas Imagens (.zip)
          </Button>
          <Button variant="outline" onClick={() => handleDownloadAssets('audios')} disabled={!hasAudios || isZipping} className="w-full justify-start gap-3">
            {isZipping && <Loader2 className="w-4 h-4 animate-spin" />}
            <FileAudio className="w-5 h-5" />
            Baixar Apenas Narrações (.zip)
          </Button>
          <Button variant="outline" onClick={() => handleDownloadAssets('all')} disabled={(!hasImages && !hasAudios) || isZipping} className="w-full justify-start gap-3">
            {isZipping && <Loader2 className="w-4 h-4 animate-spin" />}
            <FileArchive className="w-5 h-5" />
            Baixar Todos os Arquivos (.zip)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};