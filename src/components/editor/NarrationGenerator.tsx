import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';
import { blobToDataURL } from '@/lib/imageUtils';
import { Progress } from '@/components/ui/progress';
import { useSession } from '@/contexts/SessionContext';
import { supabase } from '@/integrations/supabase/client';

interface NarrationGeneratorProps {
  narrationText: string | undefined;
  onAudioGenerated: (file: File, dataUrl: string) => void;
  addDebugLog: (message: string) => void;
  audio?: File;
}

export const NarrationGenerator = ({ narrationText, onAudioGenerated, addDebugLog, audio }: NarrationGeneratorProps) => {
  const { profile } = useSession();
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audio) {
      const url = URL.createObjectURL(audio);
      setAudioUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    setAudioUrl(null);
  }, [audio]);

  const handleGenerateNarration = async () => {
    if (!narrationText || !narrationText.trim()) {
      toast.error("Por favor, insira o texto para a narração.");
      return;
    }
    setIsGenerating(true);
    addDebugLog(`[Narração IA] Iniciando geração para o texto: "${narrationText.slice(0, 50)}..."`);
    try {
      const selectedVoice = profile?.default_voice || 'nova';
      addDebugLog(`[Narração IA] Usando a voz: ${selectedVoice}`);

      const { data: responseBlob, error: invokeError } = await supabase.functions.invoke('generate-emotional-voice', {
        body: {
          text: narrationText,
          voice: selectedVoice,
        },
      });

      if (invokeError) {
        throw new Error(`Falha na comunicação com a Edge Function: ${invokeError.message}`);
      }

      if (responseBlob.type === 'application/json') {
        const errorData = JSON.parse(await responseBlob.text());
        throw new Error(`A geração de áudio falhou: ${errorData.details || errorData.error}`);
      }

      const fileName = `narration_${selectedVoice}.mp3`;
      const file = new File([responseBlob], fileName, { type: 'audio/mp3' });
      const dataUrl = await blobToDataURL(responseBlob);

      onAudioGenerated(file, dataUrl);
      addDebugLog(`[Narração IA] ✅ Áudio gerado e carregado com sucesso!`);
      toast.success("Narração gerada com sucesso!");
    } catch (error) {
      console.error("Audio generation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      addDebugLog(`[Narração IA] ❌ Falha na geração: ${errorMessage}`);
      toast.error(`Falha ao gerar a narração: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const newProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(newProgress);
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  if (audio && audioUrl) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border">
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleAudioEnd}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        <Button size="icon" className="h-8 w-8 flex-shrink-0 bg-gradient-primary text-primary-foreground" onClick={togglePlay}>
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <div className="w-full">
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-2 rounded-lg bg-muted/50 border h-[52px]">
      <Button onClick={handleGenerateNarration} disabled={isGenerating || !narrationText?.trim()} size="sm" variant="ghost" className="text-muted-foreground">
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Gerar Narração
          </>
        )}
      </Button>
    </div>
  );
};