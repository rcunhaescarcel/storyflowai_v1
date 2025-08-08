import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { SubtitleStyle, LogoPosition } from '@/hooks/useFFmpeg';

type ZoomEffect = "none" | "in" | "out" | "alternate";

export const useGlobalSettings = () => {
  const [backgroundMusic, setBackgroundMusic] = useState<File | null>(null);
  const [backgroundMusicVolume, setBackgroundMusicVolume] = useState(0.5);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>('top-right');
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>({
    fontFamily: "Arial",
    fontSize: 24,
    fontColor: "#FFFFFF",
    shadowColor: "#000000",
  });
  
  const [addFade, setAddFade] = useState(true);
  const [generateSubtitles, setGenerateSubtitles] = useState(true);
  const [zoomEffect, setZoomEffect] = useState<ZoomEffect>('alternate');
  const [zoomIntensity, setZoomIntensity] = useState(5);

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
    backgroundMusic,
    handleBackgroundMusicUpload,
    setBackgroundMusic,
    backgroundMusicVolume,
    setBackgroundMusicVolume,
    logoFile,
    logoPreview,
    handleLogoUpload,
    setLogoFile,
    setLogoPreview,
    logoPosition,
    setLogoPosition,
    subtitleStyle,
    setSubtitleStyle,
    addFade,
    setAddFade,
    generateSubtitles,
    setGenerateSubtitles,
    zoomEffect,
    setZoomEffect,
    zoomIntensity,
    setZoomIntensity,
  };
};