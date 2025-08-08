import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { Scene } from '@/hooks/useFFmpeg';
import { SceneData } from '@/types/video';

export const useProjectPersistence = (addDebugLog: (message: string) => void) => {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const uploadSceneAssets = async (scenes: Scene[], projectFolder: string): Promise<SceneData[]> => {
    const sceneDataForDb: SceneData[] = [];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      let imageUrl = scene.imagePreview || '';
      let audioDataUrl = scene.audioDataUrl || '';

      // Upload image if it's a new file
      if (scene.image && !imageUrl.startsWith('http')) {
        const imagePath = `${projectFolder}/${scene.id}-image.png`;
        const { error: imageUploadError } = await supabase.storage.from('image-references').upload(imagePath, scene.image, { upsert: true });
        if (imageUploadError) throw new Error(`Upload da imagem falhou: ${imageUploadError.message}`);
        const { data: { publicUrl } } = supabase.storage.from('image-references').getPublicUrl(imagePath);
        imageUrl = publicUrl!;
      }

      // Upload audio if it's a new file
      if (scene.audio && !audioDataUrl.startsWith('http')) {
         // This part is tricky as audio is not stored in storage currently.
         // For now, we assume audioDataUrl is sufficient if it exists.
         // A more robust solution would upload audio to storage as well.
      }

      sceneDataForDb.push({
        id: scene.id,
        image_url: imageUrl,
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
    return sceneDataForDb;
  };

  const saveProject = async (scenesToSave: Scene[], projectPrompt: string, projectStyle?: string): Promise<{id: string, title: string} | null> => {
    if (!session) {
      toast.error("Sessão não encontrada. Não foi possível salvar o projeto.");
      return null;
    }

    const savingToast = toast.loading("Salvando seu projeto...");
    setIsSaving(true);
    addDebugLog('[DB] Iniciando salvamento de novo projeto...');

    try {
      const projectTitle = projectPrompt.slice(0, 80) || 'Novo Projeto de Vídeo';
      const totalDuration = scenesToSave.reduce((acc, scene) => acc + (scene.duration || 0), 0);
      const projectId = crypto.randomUUID();
      const projectFolder = `projects/${session.user.id}/${projectId}`;
      
      const sceneDataForDb = await uploadSceneAssets(scenesToSave, projectFolder);

      const projectToInsert = {
        id: projectId,
        user_id: session.user.id,
        title: projectTitle,
        description: projectPrompt,
        input_type: 'story_prompt',
        input_content: projectPrompt,
        scenes: sceneDataForDb,
        video_duration: totalDuration,
        status: 'draft',
        style: projectStyle,
      };

      addDebugLog('[DB] Inserindo registro do projeto no banco de dados...');
      const { error: insertError } = await supabase.from('video_projects').insert(projectToInsert);
      if (insertError) {
        throw new Error(`Falha ao salvar o projeto: ${insertError.message}`);
      }

      await queryClient.invalidateQueries({ queryKey: ['video_projects'] });
      addDebugLog('[DB] ✅ Projeto salvo com sucesso!');
      toast.success("Projeto salvo!", { id: savingToast, description: "Seu novo vídeo já está na galeria." });
      return { id: projectId, title: projectTitle };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      addDebugLog(`[DB] ❌ Falha no salvamento: ${errorMessage}`);
      toast.error("Falha ao salvar o projeto", { id: savingToast, description: errorMessage });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const updateProject = async (projectId: string, scenesToUpdate: Scene[], title: string) => {
    if (!session) {
      toast.error("Sessão não encontrada. Não foi possível atualizar o projeto.");
      return;
    }

    const updatingToast = toast.loading("Salvando alterações...");
    setIsSaving(true);
    addDebugLog(`[DB] Iniciando atualização do projeto ID: ${projectId}`);

    try {
      const projectFolder = `projects/${session.user.id}/${projectId}`;
      const sceneDataForDb = await uploadSceneAssets(scenesToUpdate, projectFolder);
      const totalDuration = scenesToUpdate.reduce((acc, scene) => acc + (scene.duration || 0), 0);

      const projectToUpdate = {
        title,
        scenes: sceneDataForDb,
        video_duration: totalDuration,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('video_projects')
        .update(projectToUpdate)
        .eq('id', projectId);

      if (updateError) {
        throw new Error(`Falha ao atualizar o projeto: ${updateError.message}`);
      }

      await queryClient.invalidateQueries({ queryKey: ['video_projects'] });
      addDebugLog('[DB] ✅ Projeto atualizado com sucesso!');
      toast.success("Alterações salvas!", { id: updatingToast });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      addDebugLog(`[DB] ❌ Falha na atualização: ${errorMessage}`);
      toast.error("Falha ao salvar alterações", { id: updatingToast, description: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  return { saveProject, updateProject, isSaving };
};