import { Music, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

interface AudioUploaderProps {
  audio?: File;
  duration?: number;
  onAudioUpload: (file: File) => void;
  onAudioRemove: () => void;
  sceneId: string;
}

export const AudioUploader = ({ audio, duration, onAudioUpload, onAudioRemove, sceneId }: AudioUploaderProps) => {
  const inputId = `audio-upload-${sceneId}`;
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (audio) {
      const url = URL.createObjectURL(audio);
      setAudioUrl(url);

      return () => {
        URL.revokeObjectURL(url);
        setAudioUrl(null);
      };
    }
  }, [audio]);

  return (
    <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between border">
      <Input
        type="file"
        accept="audio/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onAudioUpload(file);
        }}
        className="hidden"
        id={inputId}
      />
      <div className="flex items-center gap-3 overflow-hidden">
        <Music className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-foreground">{audio ? 'Narração da Cena' : 'Adicionar Narração'}</p>
          <p className="text-muted-foreground truncate">
            {audio ? `${audio.name} (${duration?.toFixed(1)}s)` : 'Áudio por cena (opcional)'}
          </p>
        </div>
      </div>
      {audio && audioUrl ? (
        <div className="flex items-center gap-2">
          <audio src={audioUrl} controls className="h-8 w-48"></audio>
          <Button variant="ghost" size="icon" onClick={onAudioRemove} className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => document.getElementById(inputId)?.click()} className="flex-shrink-0">
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      )}
    </div>
  );
};