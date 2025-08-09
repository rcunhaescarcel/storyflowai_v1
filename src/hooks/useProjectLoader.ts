import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Scene } from '@/hooks/useFFmpeg';
import { VideoProject, SceneData } from '@/types/video';

interface UseProjectLoaderProps {
  onLoad: (project: VideoProject, scenes: Scene[]) => void;
  addDebugLog: (message: string) => void;
}

export const useProjectLoader = ({ onLoad, addDebugLog }: UseProjectLoaderProps) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(!!location.state?.project);

  const loadProject = useCallback((project: VideoProject) => {
    if (!project.scenes) {
      addDebugLog(`[Editor] Projeto "${project.title}" não possui cenas para carregar.`);
      onLoad(project, []);
      setIsLoading(false);
      return;
    }

    addDebugLog(`[Editor] Carregando metadados do projeto: ${project.title}`);

    try {
      const newScenes: Scene[] = project.scenes.map((sceneData: SceneData) => {
        return {
          id: sceneData.id,
          image: undefined,
          imagePreview: sceneData.image_url,
          imagePrompt: sceneData.image_prompt,
          audio: undefined,
          audioDataUrl: sceneData.audio_data_url,
          duration: sceneData.duration,
          narrationText: sceneData.narration_text,
        };
      });

      onLoad(project, newScenes);
      toast.success("Projeto carregado!", { description: "Você pode começar a editar." });
      addDebugLog(`[Editor] ✅ Metadados do projeto "${project.title}" carregados com ${newScenes.length} cenas.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      addDebugLog(`[Editor] ❌ Falha ao carregar metadados do projeto: ${errorMessage}`);
      toast.error("Falha ao carregar o projeto", { description: errorMessage });
    } finally {
      setIsLoading(false);
      window.history.replaceState({}, document.title);
    }
  }, [addDebugLog, onLoad]);

  useEffect(() => {
    const projectToLoad = location.state?.project as VideoProject | undefined;

    if (projectToLoad) {
      loadProject(projectToLoad);
    } else {
      setIsLoading(false);
    }
  }, [location.state, loadProject]);

  return { isProjectLoading: isLoading };
};