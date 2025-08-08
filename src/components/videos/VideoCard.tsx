import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Download, Pencil, Trash2, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VideoProject } from "../../types/video.ts";

interface VideoCardProps {
  project: VideoProject;
  onEdit: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}

export const VideoCard = ({ project, onEdit, onDownload, onDelete }: VideoCardProps) => {
  const isRendered = !!project.final_video_url;
  const thumbnailUrl = project.scenes?.[0]?.image_url || `https://placehold.co/1600x900/2a2a2a/ffffff?text=${encodeURI(project.title)}`;
  
  const formatDuration = (seconds: number | null | undefined) => {
    if (seconds === null || seconds === undefined) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="overflow-hidden group transition-all hover:shadow-xl hover:-translate-y-1">
      <div className="relative">
        <AspectRatio ratio={16 / 9}>
          <img src={thumbnailUrl} alt={project.title} className="object-cover w-full h-full bg-muted" crossOrigin="anonymous" />
        </AspectRatio>
        
        {isRendered ? (
          <a href={project.final_video_url!} target="_blank" rel="noopener noreferrer" aria-label="Play video">
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
            </div>
          </a>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
        )}

        {project.video_duration && (
          <Badge variant="secondary" className="absolute bottom-3 right-3 bg-black/50 text-white border-none">
            {formatDuration(project.video_duration)}
          </Badge>
        )}
      </div>
      <CardContent className="p-4 space-y-3 bg-background">
        <h3 className="font-bold text-lg truncate">{project.title}</h3>
        <p className="text-sm text-muted-foreground">
          {project.scenes?.length || 0} cenas • {project.style || 'Animação 3D'}
        </p>
        <div className="flex items-center gap-2 pt-2">
          <Button onClick={() => onEdit(project.id)} className="w-full bg-primary hover:bg-primary/90">
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onDownload(project.id)}
            disabled={!project.final_video_url}
            aria-label="Baixar vídeo"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onDelete(project.id)}
            className="hover:bg-destructive/10 hover:text-destructive"
            aria-label="Deletar vídeo"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};