import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VideoProject } from "../types/video.ts";
import { VideoCard } from "../components/videos/VideoCard.tsx";
import { VideoCardSkeleton } from "../components/videos/VideoCardSkeleton.tsx";
import { Sparkles, Video as VideoIcon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext.tsx";
import { useRender } from "@/contexts/RenderContext.tsx";

const fetchVideoProjects = async (userId: string): Promise<VideoProject[]> => {
  const { data, error } = await supabase
    .from('video_projects')
    .select('id, title, video_duration, status, final_video_url, created_at, style, thumbnail_url, scene_count')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message);
  }
  return data as VideoProject[];
};

const fetchFullProject = async (id: string) => {
  const { data, error } = await supabase
    .from('video_projects')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

const Videos = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, isLoading: isSessionLoading } = useSession();
  const { isRendering, renderingProjectId } = useRender();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: projects, isLoading: isProjectsLoading, isError, error } = useQuery<VideoProject[]>({
    queryKey: ['video_projects', session?.user?.id],
    queryFn: () => fetchVideoProjects(session!.user.id),
    enabled: !isSessionLoading && !!session,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('video_projects').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Vídeo deletado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['video_projects'] });
    },
    onError: (err: Error) => {
      toast.error(`Falha ao deletar o vídeo: ${err.message}`);
    },
  });

  const editMutation = useMutation({
    mutationFn: fetchFullProject,
    onSuccess: (project) => {
      if (project) {
        const isProjectRendering = isRendering && renderingProjectId === project.id;
        navigate('/editor', { state: { project, resumeRender: isProjectRendering } });
      } else {
        toast.error("Projeto não encontrado para edição.");
      }
      setEditingId(null);
    },
    onError: (err: Error) => {
      toast.error(`Falha ao carregar projeto: ${err.message}`);
      setEditingId(null);
    }
  });

  const handleEdit = (id: string) => {
    setEditingId(id);
    editMutation.mutate(id);
  };

  const handleDownload = (id: string) => {
    const project = projects?.find(p => p.id === id);
    if (project?.final_video_url) {
      window.open(project.final_video_url, '_blank');
    } else {
      toast.error("URL de download não encontrada.");
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const renderContent = () => {
    const isLoading = isSessionLoading || isProjectsLoading;

    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <VideoCardSkeleton key={i} />)}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center py-16 border rounded-lg bg-background">
          <p className="text-destructive">Erro ao carregar vídeos: {error?.message}</p>
        </div>
      );
    }

    if (!projects || projects.length === 0) {
      return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg bg-background/50">
          <VideoIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Nenhum vídeo encontrado</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Comece a criar seu primeiro vídeo para vê-lo aqui.
          </p>
          <Button className="mt-6" onClick={() => navigate('/editor')}>
            <Sparkles className="w-4 h-4 mr-2" />
            Criar Primeiro Vídeo
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map(project => (
          <VideoCard 
            key={project.id} 
            project={project}
            onEdit={handleEdit}
            onDownload={handleDownload}
            onDelete={handleDelete}
            isEditing={editingId === project.id}
            isCurrentlyRendering={isRendering && renderingProjectId === project.id}
          />
        ))}
      </div>
    );
  };

  return (
    <main className="container max-w-screen-xl mx-auto px-12 py-8">
      <div className="text-center mt-8 mb-12">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <span className="bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text">
            Seus Vídeos
          </span>
          <span className="text-foreground">Mágicos</span>
          <Sparkles className="w-8 h-8" stroke="url(#icon-gradient)" />
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Gerencie e edite seus vídeos criados com IA. Aqui você pode revisitar, baixar ou remover seus projetos.
        </p>
      </div>
      {renderContent()}
    </main>
  );
};

export default Videos;