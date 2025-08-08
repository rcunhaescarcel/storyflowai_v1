import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Download, Pencil, Trash2, Play, Loader2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VideoProject } from "../../types/video.ts";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  project: VideoProject;
  onEdit: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  isCurrentlyRendering: boolean;
}

export const VideoCard = ({ project, onEdit, onDownload, onDelete, isEditing, isCurrentlyRendering }: VideoCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isRendered = !!project.final_video_url;
  const thumbnailUrl = project.thumbnail_url || `https://placehold.co/1600x900/2a2a2a/ffffff?text=${encodeURI(project.title)}`;
  
  const formatDuration = (seconds: number | null | undefined) => {
    if (seconds === null || seconds === undefined) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRendered) {
      setIsPlaying(true);
    }
  };

  return (
    <Card className={cn("overflow-hidden group transition-all hover:shadow-xl hover:-translate-y-1", isCurrentlyRendering && "ring-2 ring-primary")}>
      <div className="relative">
        <AspectRatio ratio={16 / 9} className="bg-muted">
          {isPlaying && isRendered ? (
            <video
              key={project.final_video_url}
              src={project.final_video_url!}
              controls
              autoPlay
              className="w-full h-full object-contain bg-black"
              onEnded={() => setIsPlaying(false)}
            />
          ) : (
            <img src={thumbnailUrl} alt={project.title} className="object-cover w-full h-full" crossOrigin="anonymous" />
          )}
        </AspectRatio>
        
        {isCurrentlyRendering ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <p className="text-white font-semibold mt-2">Renderizando...</p>
          </div>
        ) : isRendered && !isPlaying ? (
          <div 
            onClick={handlePlayClick} 
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 cursor-pointer"
            aria-label="Play video"
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
          </div>
        ) : !isRendered ? (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
        ) : null}

        {project.video_duration && !isCurrentlyRendering && !isPlaying && (
          <Badge variant="secondary" className="absolute bottom-3 right-3 bg-black/50 text-white border-none">
            {formatDuration(project.video_duration)}
          </Badge>
        )}
      </div>
      <CardContent className="p-3 space-y-2 bg-background">
        <h3 className="font-semibold text-base truncate">{project.title}</h3>
        <p className="text-sm text-muted-foreground">
          {project.scene_count || 0} cenas • {project.style || 'Animação 3D'}
        </p>
        <div className="flex items-center gap-2 pt-1">
          <Button 
            onClick={() => onEdit(project.id)} 
            className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity" 
            size="sm"
            disabled={isEditing}
          >
            {isEditing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : isCurrentlyRendering ? (
              <Eye className="w-4 h-4 mr-2" />
            ) : (
              <Pencil className="w-4 h-4 mr-2" />
            )}
            {isEditing ? 'Carregando...' : isCurrentlyRendering ? 'Ver Progresso' : 'Editar'}
          </Button>
          {isRendered && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => onDownload(project.id)}
              aria-label="Baixar vídeo"
              className="h-9 w-9"
              disabled={isCurrentlyRendering}
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onDelete(project.id)}
            className="hover:bg-destructive/10 hover:text-destructive h-9 w-9"
            aria-label="Deletar vídeo"
            disabled={isCurrentlyRendering}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};