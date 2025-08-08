import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { SubtitleStyle, LogoPosition } from '@/hooks/useFFmpeg';
import { resizeImage, dataURLtoFile } from '@/lib/imageUtils';

type VideoQuality = 'hd' | 'fullhd';

export const useGlobalSettings = () => {
  const [globalSrtFile, setGlobalSrtFile] = useState<File | null>(null);
  const [backgroundMusic, setBackgroundMusic] = useState<File | null>(null);
  const [backgroundMusicVolume, setBackgroundMusicVolume] = useState(0.5);
  const [videoQuality, setVideoQuality] = useState<VideoQuality>('fullhd');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>('top-right');
  const [characterImage, setCharacterImage] = useState<File | null>(null);
  const [characterImagePreview, setCharacterImagePreview] = useState<string | null>(null);
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>({
    fontFamily: "Arial",
    fontSize: 24,
    fontColor: "#ffffff",
    shadowColor: "#000000",
  });
  const [zoomEffect, setZoomEffect] = useState<'none' | 'in' | 'out' | 'alternate'>('alternate');
  const [zoomIntensity, setZoomIntensity] = useState(20);
  const [addFade, setAddFade] = useState(true);
  const [fadeInDuration, setFadeInDuration] = useState(0.5);
  const [fadeOutDuration, setFadeOutDuration] = useState(0.5);

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

  const handleCharacterImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalFile = e.target.files?.[0];
    if (originalFile && originalFile.type.startsWith('image/')) {
      try {
        const resizedImagePreview = await resizeImage(originalFile, 1024, 1024);
        const resizedFile = dataURLtoFile(resizedImagePreview, originalFile.name);
        
        setCharacterImage(resizedFile);
        setCharacterImagePreview(resizedImagePreview);
        
        toast.success("Personagem de Referência Carregado", {
          description: "A imagem foi otimizada e está pronta para ser usada.",
        });
      } catch (error) {
        toast.error("Erro ao processar imagem", {
          description: "Não foi possível redimensionar a imagem.",
        });
      }
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
    characterImage,
    characterImagePreview,
    handleCharacterImageUpload,
    setCharacterImage,
    setCharacterImagePreview,
    subtitleStyle,
    setSubtitleStyle,
    zoomEffect,
    setZoomEffect,
    zoomIntensity,
    setZoomIntensity,
    addFade,
    setAddFade,
    fadeInDuration,
    setFadeInDuration,
    fadeOutDuration,
    setFadeOutDuration,
  };
};