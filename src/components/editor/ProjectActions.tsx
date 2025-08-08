import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Video, Download, Copy } from 'lucide-react';
import { Scene } from '@/hooks/useFFmpeg';
import { toast } from 'sonner';

interface ProjectActionsProps {
  scenes: Scene[];
  onRenderClick: () => void;
  onDownloadClick: () => void;
  videoUrl: string | null;
}

export const ProjectActions = ({ scenes, onRenderClick, onDownloadClick, videoUrl }: ProjectActionsProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const audioPlaylist = useMemo(() => scenes.map(s => s.audioDataUrl).filter(Boolean) as string[], [scenes]);

  useEffect(() => {
    const durations = scenes.map(s => s.duration || 0);
    setTotalDuration(durations.reduce((acc, d) => acc + d, 0));
  }, [scenes]);

  useEffect(() => {
    if (audioRef.current && audioPlaylist[currentSceneIndex]) {
      audioRef.current.src = audioPlaylist[currentSceneIndex];
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
    }
  }, [currentSceneIndex, audioPlaylist, isPlaying]);

  const handlePlayPause = () => {
    if (audioPlaylist.length === 0) {
        toast.info("Nenhuma narração para tocar.");
        return;
    }
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const timeInPreviousScenes = scenes.slice(0, currentSceneIndex).reduce((acc, s) => acc + (s.duration || 0), 0);
      setCurrentTime(timeInPreviousScenes + audioRef.current.currentTime);
    }
  };

  const handleAudioEnded = () => {
    if (currentSceneIndex < audioPlaylist.length - 1) {
      setCurrentSceneIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
      setCurrentSceneIndex(0);
      setCurrentTime(0);
    }
  };

  const handleCopyScript = () => {
    const script = scenes.map(s => s.narrationText || '').join('\n\n');
    if (script) {
      navigator.clipboard.writeText(script);
      toast.success("Roteiro copiado para a área de transferência!");
    } else {
      toast.error("Nenhum roteiro para copiar.");
    }
  };

  const progressPercentage = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
  const canDownload = videoUrl || scenes.some(s => s.image || s.audio);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handlePlayPause} disabled={audioPlaylist.length === 0}>
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
        <div className="w-full">
          <Progress value={progressPercentage} className="h-2" />
        </div>
        <Button onClick={onRenderClick}>
          <Video className="w-4 h-4 mr-2" />
          Criar Vídeo
        </Button>
        <Button variant="outline" size="icon" onClick={onDownloadClick} disabled={!canDownload}>
          <Download className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleCopyScript}>
          <Copy className="w-4 h-4" />
        </Button>
        <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={handleAudioEnded} />
      </div>
    </Card>
  );
};