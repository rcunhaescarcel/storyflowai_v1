import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Scene } from '@/hooks/useFFmpeg';
import { urlToFile } from '@/lib/imageUtils';
import { getAudioDuration } from '@/lib/utils';
import { VideoProject, SceneData } from '@/types/video';

interface UseProjectLoaderProps {
  onLoad: (project: VideoProject, scenes: Scene[]) => void;
  addDebugLog: (message: string) => void;
}

export const useProjectLoader = ({ onLoad, addDebugLog }: UseProjectLoaderProps) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(!!location.state?.project);

  useEffect(() => {
    const projectToLoad = location.state?.project as VideoProject | undefined;

    const loadProject = async (project: VideoProject) => {
      if (!project.scenes) {
        addDebugLog(`[Editor] Projeto "${project.title}" não possui cenas para carregar.`);
        onLoad(project, []);
        setIsLoading(false);
        return;
      }

      const loadingToast = toast.loading("Carregando seu projeto...");
      addDebugLog(`[Editor] Carregando projeto: ${project.title}`);

      try {
        const newScenes: Scene[] = await Promise.all(
          project.scenes.map(async (sceneData: SceneData, index: number) => {
            let imageFile: File | undefined;
            let audioFile: File | undefined;
            let audioDuration: number | undefined;

            if (sceneData.image_url) {
              try {
                imageFile = await urlToFile(sceneData.image_url, `scene_${index}_image.png`, 'image/png');
              } catch (e) {
                addDebugLog(`[Editor] ⚠️ Falha ao carregar imagem da cena ${index + 1}: ${e instanceof Error ? e.message : String(e)}`);
              }
            }

            if (sceneData.audio_data_url) {
              try {
                const audioResponse = await fetch(sceneData.audio_data_url);
                const audioBlob = await audioResponse.blob();
                audioFile = new File([audioBlob], `scene_${index}_audio.mp3`, { type: 'audio/mp3' });
                audioDuration = await getAudioDuration(audioFile);
              }
              catch (e)
              {
                addDebugLog(`[Editor] ⚠️ Falha ao carregar áudio da cena ${index + 1}: ${e instanceof Error ? e.message : String(e)}`);
              }
            }

            return {
              id: sceneData.id,
              image: imageFile,
              imagePreview: sceneData.image_url,
              imagePrompt: sceneData.narration_text, // Fallback, should be stored separately
              audio: audioFile,
              audioDataUrl: sceneData.audio_data_url,
              duration: audioDuration || sceneData.duration,
              narrationText: sceneData.narration_text,
            };
          })
        );

        onLoad(project, newScenes);
        toast.success("Projeto carregado com sucesso!", { id: loadingToast });
        addDebugLog(`[Editor] ✅ Projeto "${project.title}" carregado com ${newScenes.length} cenas.`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
        addDebugLog(`[Editor] ❌ Falha ao carregar projeto: ${errorMessage}`);
        toast.error("Falha ao carregar o projeto", { id: loadingToast, description: errorMessage });
      } finally {
        setIsLoading(false);
        window.history.replaceState({}, document.title);
      }
    };

    if (projectToLoad) {
      loadProject(projectToLoad);
    } else {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, addDebugLog]);

  return { isProjectLoading: isLoading };
};