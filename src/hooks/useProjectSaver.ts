import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { Scene } from '@/hooks/useFFmpeg';
import { SceneData } from '@/types/video';

export const useProjectSaver = (addDebugLog: (message: string) => void) => {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const saveProject = async (scenesToSave: Scene[], projectPrompt: string) => {
    if (!session) {
      toast.error("Sessão não encontrada. Não foi possível salvar o projeto.");
      return;
    }

    const savingToast = toast.loading("Salvando seu projeto em segundo plano...");
    setIsSaving(true);
    addDebugLog('[DB] Iniciando salvamento do projeto...');

    try {
      const projectTitle = projectPrompt.slice(0, 80) || 'Novo Projeto de Vídeo';
      const totalDuration = scenesToSave.reduce((acc, scene) => acc + (scene.duration || 0), 0);
      const sceneDataForDb: SceneData[] = [];
      const projectFolder = `projects/${session.user.id}/${crypto.randomUUID()}`;

      for (let i = 0; i < scenesToSave.length; i++) {
        const scene = scenesToSave[i];
        if (!scene.image) {
          addDebugLog(`[DB] ⚠️ Imagem da cena ${i + 1} não encontrada. Pulando upload para esta cena.`);
          continue;
        }

        const imagePath = `${projectFolder}/${scene.id}-image.png`;
        const { error: imageUploadError } = await supabase.storage.from('image-references').upload(imagePath, scene.image);
        if (imageUploadError) throw new Error(`Upload da imagem falhou: ${imageUploadError.message}`);
        const { data: { publicUrl: imageUrl } } = supabase.storage.from('image-references').getPublicUrl(imagePath);

        sceneDataForDb.push({
          id: scene.id,
          image_url: imageUrl!,
          imagePreview: scene.imagePreview,
          audio_data_url: scene.audioDataUrl,
          narration_text: scene.narrationText,
          duration: scene.duration,
          effect: scene.effect,
          zoomEnabled: scene.zoomEnabled,
          zoomIntensity: scene.zoomIntensity,
          zoomDirection: scene.zoomDirection,
          fadeInDuration: scene.fadeInDuration,
          fadeOutDuration: scene.fadeOutDuration,
        });
      }

      const projectToInsert = {
        user_id: session.user.id,
        title: projectTitle,
        description: projectPrompt,
        input_type: 'story_prompt',
        input_content: projectPrompt,
        scenes: sceneDataForDb,
        video_duration: totalDuration,
        status: 'draft',
      };

      addDebugLog('[DB] Inserindo registro do projeto no banco de dados...');
      const { error: insertError } = await supabase.from('video_projects').insert(projectToInsert);
      if (insertError) {
        throw new Error(`Falha ao salvar o projeto: ${insertError.message}`);
      }

      await queryClient.invalidateQueries({ queryKey: ['video_projects'] });
      addDebugLog('[DB] ✅ Projeto salvo com sucesso!');
      toast.success("Projeto salvo!", { id: savingToast, description: "Seu novo vídeo já está na galeria." });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      addDebugLog(`[DB] ❌ Falha no salvamento: ${errorMessage}`);
      toast.error("Falha ao salvar o projeto", { id: savingToast, description: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  return { saveProject, isSaving };
};