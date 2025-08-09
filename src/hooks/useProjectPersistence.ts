import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { Scene, VideoFormat } from '@/hooks/useFFmpeg';
import { SceneData, VideoProject } from '@/types/video';
import { urlToFile } from '@/lib/imageUtils';

export const useProjectPersistence = (addDebugLog: (message: string) => void) => {
  const { session } = useSession();
  const queryClient = useQueryClient();

  const uploadSceneAssets = async (scenes: Scene[], projectFolder: string): Promise<SceneData[]> => {
    const sceneDataForDb: SceneData[] = [];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      let imageUrl = scene.imagePreview || '';
      let audioDataUrl = scene.audioDataUrl || '';

      if (scene.image && !imageUrl.startsWith('http')) {
        const imagePath = `${projectFolder}/${scene.id}-image.png`;
        const { error: imageUploadError } = await supabase.storage.from('image-references').upload(imagePath, scene.image, { upsert: true });
        if (imageUploadError) throw new Error(`Upload da imagem falhou: ${imageUploadError.message}`);
        const { data: { publicUrl } } = supabase.storage.from('image-references').getPublicUrl(imagePath);
        imageUrl = publicUrl!;
      }

      sceneDataForDb.push({
        id: scene.id,
        image_url: imageUrl,
        imagePreview: scene.imagePreview,
        image_prompt: scene.imagePrompt,
        audio_data_url: scene.audioDataUrl,
        narration_text: scene.narrationText,
        duration: scene.duration,
      });
    }
    return sceneDataForDb;
  };

  const saveProject = async (scenesToSave: Scene[], projectTitle: string, projectDescription: string, projectStyle?: string, videoFormat: VideoFormat = 'landscape'): Promise<VideoProject | null> => {
    if (!session) {
      toast.error("Sessão não encontrada. Não foi possível salvar o projeto.");
      return null;
    }

    const savingToast = toast.loading("Salvando seu projeto...");
    addDebugLog('[DB] Iniciando salvamento de novo projeto...');

    try {
      const totalDuration = scenesToSave.reduce((acc, scene) => acc + (scene.duration || 0), 0);
      const projectId = crypto.randomUUID();
      const projectFolder = `projects/${session.user.id}/${projectId}`;
      
      const sceneDataForDb = await uploadSceneAssets(scenesToSave, projectFolder);
      const thumbnailUrl = sceneDataForDb.length > 0 ? sceneDataForDb[0].image_url : null;

      const projectToInsert: Omit<VideoProject, 'user_id' | 'created_at' | 'updated_at' | 'is_featured'> & { user_id: string } = {
        id: projectId,
        user_id: session.user.id,
        title: projectTitle,
        description: projectDescription,
        input_type: 'story_prompt',
        input_content: projectDescription,
        scenes: sceneDataForDb,
        video_duration: totalDuration,
        status: 'draft',
        style: projectStyle,
        thumbnail_url: thumbnailUrl,
        scene_count: scenesToSave.length,
        final_video_url: null,
        format: videoFormat,
      };

      addDebugLog('[DB] Inserindo registro do projeto no banco de dados...');
      const { data: newProject, error: insertError } = await supabase.from('video_projects').insert(projectToInsert).select().single();
      if (insertError) {
        throw new Error(`Falha ao salvar o projeto: ${insertError.message}`);
      }

      await queryClient.invalidateQueries({ queryKey: ['video_projects'] });
      addDebugLog('[DB] ✅ Projeto salvo com sucesso!');
      toast.success("Projeto salvo!", { id: savingToast, description: "Seu novo vídeo já está na galeria." });
      return newProject;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      addDebugLog(`[DB] ❌ Falha no salvamento: ${errorMessage}`);
      toast.error("Falha ao salvar o projeto", { id: savingToast, description: errorMessage });
      return null;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<VideoProject>) => {
    if (!session) {
      toast.error("Sessão não encontrada. Não foi possível atualizar o projeto.");
      return null;
    }
    const { error } = await supabase
      .from('video_projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', projectId);

    if (error) {
      toast.error("Falha ao salvar alterações", { description: error.message });
    } else {
      toast.success("Alterações salvas com sucesso!");
      await queryClient.invalidateQueries({ queryKey: ['video_projects'] });
    }
  };

  const saveRenderedVideo = async (projectId: string, videoBlobUrl: string): Promise<string | null> => {
    addDebugLog(`[Persistence] Iniciando saveRenderedVideo para o projeto ${projectId}`);
    if (!session) {
      toast.error("Sessão não encontrada. Não foi possível salvar o vídeo.");
      addDebugLog("[Persistence] ❌ Erro: Sessão do usuário não encontrada.");
      return null;
    }
    const savingToast = toast.loading("Salvando vídeo na nuvem...");
    try {
      const videoFile = await urlToFile(videoBlobUrl, `final_video_${projectId}.mp4`, 'video/mp4');
      addDebugLog(`[Persistence] Blob convertido para arquivo: ${videoFile.name}, tamanho: ${videoFile.size} bytes`);
      const filePath = `${session.user.id}/${projectId}/final_video.mp4`;

      addDebugLog(`[Persistence] Enviando vídeo para: ${filePath}`);
      const { error: uploadError } = await supabase.storage
        .from('final_videos')
        .upload(filePath, videoFile, { upsert: true });

      if (uploadError) {
        throw new Error(`Falha no upload do vídeo: ${uploadError.message}`);
      }
      addDebugLog(`[Persistence] Upload para Supabase Storage concluído com sucesso.`);
      
      const { data } = supabase.storage
        .from('final_videos')
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        throw new Error('Não foi possível obter a URL pública do vídeo.');
      }

      const publicUrl = data.publicUrl;
      addDebugLog(`[Persistence] URL pública obtida: ${publicUrl}`);

      addDebugLog(`[Persistence] Atualizando projeto ${projectId} com a URL do vídeo...`);
      const { error: dbError } = await supabase
        .from('video_projects')
        .update({ final_video_url: publicUrl, status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', projectId);

      if (dbError) {
        throw new Error(`Falha ao atualizar o projeto no banco de dados: ${dbError.message}`);
      }
      
      addDebugLog(`[Persistence] Registro do projeto no DB atualizado com sucesso.`);
      await queryClient.invalidateQueries({ queryKey: ['video_projects'] });
      toast.success("Vídeo salvo na nuvem!", { id: savingToast });
      addDebugLog(`[Persistence] Retornando URL final: ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      addDebugLog(`[Persistence] ❌ Falha ao salvar vídeo: ${errorMessage}`);
      toast.error("Falha ao salvar o vídeo", { id: savingToast, description: errorMessage });
      return null;
    }
  };

  return { saveProject, updateProject, saveRenderedVideo };
};