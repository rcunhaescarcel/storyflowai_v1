import { useState, useCallback } from 'react';
import { Scene } from '@/hooks/useFFmpeg';
import { toast } from 'sonner';

const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!file) return reject("No file provided");
    const audio = document.createElement('audio');
    const objectUrl = URL.createObjectURL(file);
    audio.src = objectUrl;
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
      URL.revokeObjectURL(objectUrl);
    };
    audio.onerror = (e) => {
      reject(`Error loading audio file: ${e}`);
      URL.revokeObjectURL(objectUrl);
    };
  });
};

export const useScenes = (initialScenes: Scene[] = []) => {
  const [scenes, setScenes] = useState<Scene[]>(initialScenes);

  const addNewScene = useCallback(() => {
    const newScene: Scene = {
      id: crypto.randomUUID(),
      narrationText: ""
    };
    setScenes(prev => [...prev, newScene]);
  }, []);

  const updateScene = useCallback((id: string, updates: Partial<Scene>) => {
    setScenes(prev => prev.map(scene =>
      scene.id === id ? { ...scene, ...updates } : scene
    ));
  }, []);

  const deleteScene = useCallback((id: string) => {
    setScenes(prev => prev.filter(scene => scene.id !== id));
  }, []);

  const moveSceneUp = useCallback((index: number) => {
    if (index === 0) return;
    setScenes(prev => {
      const newScenes = [...prev];
      [newScenes[index - 1], newScenes[index]] = [newScenes[index], newScenes[index - 1]];
      return newScenes;
    });
  }, []);

  const moveSceneDown = useCallback((index: number) => {
    setScenes(prev => {
      if (index >= prev.length - 1) return prev;
      const newScenes = [...prev];
      [newScenes[index + 1], newScenes[index]] = [newScenes[index], newScenes[index + 1]];
      return newScenes;
    });
  }, []);

  const handleImageGenerated = useCallback((sceneId: string, file: File, prompt: string) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateScene(sceneId, {
          image: file,
          imagePreview: e.target?.result as string,
          imagePrompt: prompt
        });
      };
      reader.readAsDataURL(file);
    }
  }, [updateScene]);

  const handleImageRemove = useCallback((sceneId: string) => {
    updateScene(sceneId, {
      image: undefined,
      imagePreview: undefined,
      imagePrompt: undefined
    });
  }, [updateScene]);

  const handleNarrationUpload = useCallback(async (sceneId: string, file: File, dataUrl: string) => {
    if (file && file.type.startsWith('audio/')) {
      try {
        const duration = await getAudioDuration(file);
        updateScene(sceneId, { audio: file, duration, audioDataUrl: dataUrl });
        toast.success("Narração carregada", {
          description: `Áudio de ${duration.toFixed(1)}s adicionado à cena.`,
        });
      } catch (error) {
        console.error("Error getting audio duration:", error);
        toast.error("Erro ao carregar áudio", {
          description: "Não foi possível obter a duração do áudio.",
        });
      }
    }
  }, [updateScene]);

  return {
    scenes,
    setScenes,
    addNewScene,
    updateScene,
    deleteScene,
    moveSceneUp,
    moveSceneDown,
    handleImageGenerated,
    handleImageRemove,
    handleNarrationUpload,
  };
};