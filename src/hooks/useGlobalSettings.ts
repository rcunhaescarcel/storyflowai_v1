import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { SubtitleStyle, LogoPosition } from '@/hooks/useFFmpeg';

type VideoQuality = 'hd' | 'fullhd';

export const useGlobalSettings = () => {
  const [globalSrtFile, setGlobalSrtFile] = useState<File | null>(null);
  const [backgroundMusic, setBackgroundMusic] = useState<File | null>(null);
  const [backgroundMusicVolume, setBackgroundMusicVolume] = useState(0.5);
  const [videoQuality, setVideoQuality] = useState<VideoQuality>('fullhd');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>('top-right');
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>({
    fontFamily: "Arial",
    fontSize: 24,
    fontColor: "#ffffff",
    shadowColor: "#000000",
  });
  const [addVisualEffects, setAddVisualEffects] = useState(true);

  const handleSrtUpload = useCallback((file: File) => {
    if (file && (file.name.endsWith('.srt') || file.type === 'text/plain')) {
      setGlobalSrtFile(file);
      toast.success("Legenda Global Carregada", {
        description: "Arquivo SRT será aplicado a todo o vídeo.",
      });
    }
  }, []);

  const handleBackgroundMusicUpload = useCallback((file: File) => {
    if (file && file.type.startsWith('audio/')) {
      setBackgroundMusic(file);
      toast.success("Trilha Sonora Carregada", {
        description: "A música de fundo será aplicada a todo o vídeo.",
      });
    }
  }, []);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success("Logotipo Carregado", {
        description: "O logotipo será adicionado ao vídeo.",
      });
    }
  }, []);

  return {
    globalSrtFile,
    handleSrtUpload,
    setGlobalSrtFile,
    backgroundMusic,
    handleBackgroundMusicUpload,
    setBackgroundMusic,
    backgroundMusicVolume,
    setBackgroundMusicVolume,
    videoQuality,
    setVideoQuality,
    logoFile,
    logoPreview,
    handleLogoUpload,
    setLogoFile,
    setLogoPreview,
    logoPosition,
    setLogoPosition,
    subtitleStyle,
    setSubtitleStyle,
    addVisualEffects,
    setAddVisualEffects,
  };
};