import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Scene, useFFmpeg, SubtitleStyle, LogoPosition } from "@/hooks/useFFmpeg";
import { resizeImage, dataURLtoFile } from "@/lib/imageUtils";
import { ViewImageModal } from "@/components/editor/ViewImageModal";
import { StoryPromptForm } from "@/components/editor/StoryPromptForm";
import { SceneCard } from "@/components/editor/SceneCard";
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DebugConsole } from "@/components/editor/DebugConsole";
import { useSession } from "./contexts/SessionContext";
import { supabase } from "./integrations/supabase/client";
import { SceneData } from "./types/video";

type VideoQuality = 'hd' | 'fullhd';

const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject("No file provided");
      return;
    }
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
    }
  });
};

const Editor = () => {
  const [scenes, setScenes] = useState<Scene[]>([]);
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

  const { 
    renderVideo, 
    isProcessing, 
    progress, 
    debugLogs, 
    clearDebugLogs,
    addDebugLog
  } = useFFmpeg();
  
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { session } = useSession();
  const queryClient = useQueryClient();

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
        if (!scene.image || !scene.audio) {
          addDebugLog(`[DB] ⚠️ Arquivos da cena ${i + 1} não encontrados. Pulando upload para esta cena.`);
          continue;
        }
  
        const imagePath = `${projectFolder}/${scene.id}-image.png`;
        const { error: imageUploadError } = await supabase.storage.from('image-references').upload(imagePath, scene.image);
        if (imageUploadError) throw new Error(`Upload da imagem falhou: ${imageUploadError.message}`);
        const { data: { publicUrl: imageUrl } } = supabase.storage.from('image-references').getPublicUrl(imagePath);
  
        const audioPath = `${projectFolder}/${scene.id}-audio.mp3`;
        const { error: audioUploadError } = await supabase.storage.from('image-references').upload(audioPath, scene.audio);
        if (audioUploadError) throw new Error(`Upload do áudio falhou: ${audioUploadError.message}`);
        const { data: { publicUrl: audioUrl } } = supabase.storage.from('image-references').getPublicUrl(audioPath);
  
        sceneDataForDb.push({
          id: scene.id, image_url: imageUrl!, imagePreview: scene.imagePreview, audio_url: audioUrl!, narration_text: scene.narrationText,
          duration: scene.duration, effect: scene.effect, zoomEnabled: scene.zoomEnabled,
          zoomIntensity: scene.zoomIntensity, zoomDirection: scene.zoomDirection,
          fadeInDuration: scene.fadeInDuration, fadeOutDuration: scene.fadeOutDuration,
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

  const addNewScene = () => {
    const newScene: Scene = {
      id: crypto.randomUUID(),
      effect: "fade",
      zoomEnabled: false,
      zoomIntensity: 20,
      zoomDirection: "in",
      fadeInDuration: 0.5,
      fadeOutDuration: 0.5,
      narrationText: ""
    };
    setScenes([...scenes, newScene]);
  };

  const updateScene = (id: string, updates: Partial<Scene>) => {
    setScenes(scenes.map(scene => 
      scene.id === id ? { ...scene, ...updates } : scene
    ));
  };

  const deleteScene = (id: string) => {
    setScenes(scenes.filter(scene => scene.id !== id));
  };

  const moveSceneUp = (index: number) => {
    if (index === 0) return;
    const newScenes = [...scenes];
    [newScenes[index - 1], newScenes[index]] = [newScenes[index], newScenes[index - 1]];
    setScenes(newScenes);
  };

  const moveSceneDown = (index: number) => {
    if (index === scenes.length - 1) return;
    const newScenes = [...scenes];
    [newScenes[index + 1], newScenes[index]] = [newScenes[index], newScenes[index + 1]];
    setScenes(newScenes);
  };

  const handleImageUpload = (sceneId: string, file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateScene(sceneId, { 
          image: file, 
          imagePreview: e.target?.result as string 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNarrationUpload = async (sceneId: string, file: File) => {
    if (file && file.type.startsWith('audio/')) {
      try {
        const duration = await getAudioDuration(file);
        updateScene(sceneId, { audio: file, duration });
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
  };

  const handleSrtUpload = (file: File) => {
    if (file && (file.name.endsWith('.srt') || file.type === 'text/plain')) {
      setGlobalSrtFile(file);
      toast.success("Legenda Global Carregada", {
        description: "Arquivo SRT será aplicado a todo o vídeo.",
      });
    }
  };

  const handleBackgroundMusicUpload = (file: File) => {
    if (file && file.type.startsWith('audio/')) {
      setBackgroundMusic(file);
      toast.success("Trilha Sonora Carregada", {
        description: "A música de fundo será aplicada a todo o vídeo.",
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const handleCharacterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const handleRenderVideo = async () => {
    if (scenes.length === 0) {
      toast.error("Erro", { description: "Adicione pelo menos uma cena para renderizar" });
      return;
    }
    if (scenes.some(scene => !scene.image)) {
      toast.warning("Aviso", { description: "Todas as cenas precisam de uma imagem para renderizar." });
      return;
    }

    try {
      setVideoUrl(null);
      clearDebugLogs();
      const result = await renderVideo(scenes, globalSrtFile, backgroundMusic, subtitleStyle, backgroundMusicVolume, videoQuality, logoFile, logoPosition);
      if (result) {
        setVideoUrl(result);
        toast.success("Sucesso!", { description: "Vídeo renderizado com sucesso" });
      } else {
        toast.error("Erro", { description: "Falha ao renderizar o vídeo" });
      }
    } catch (error) {
      toast.error("Erro na Renderização", { description: `${error}` });
    }
  };

  const downloadVideo = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = 'viflow-video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const copyLogsToClipboard = () => {
    if (debugLogs.length === 0) {
      toast.info("Nada para copiar", { description: "Não há logs no console de debug." });
      return;
    }
    const logText = debugLogs.join('\n');
    navigator.clipboard.writeText(logText).then(() => {
      toast.success("Copiado!", { description: "Os logs de debug foram copiados para a área de transferência." });
    }).catch(err => {
      console.error('Failed to copy logs: ', err);
      toast.error("Erro ao copiar", { description: "Não foi possível copiar os logs." });
    });
  };

  const handleStoryGenerated = (newScenes: Scene[], characterFile?: File, characterPreview?: string, projectPrompt?: string) => {
    setScenes(newScenes);
    if (characterFile && characterPreview) {
      setCharacterImage(characterFile);
      setCharacterImagePreview(characterPreview);
    }
    addDebugLog(`[Editor] História gerada com ${newScenes.length} cenas.`);
    toast.success("Cenas Criadas!", {
      description: `Sua história foi dividida em ${newScenes.length} cenas.`,
    });
  
    if (projectPrompt) {
      saveProject(newScenes, projectPrompt);
    }
  };

  return (
    <>
      <main className="container max-w-screen-xl mx-auto px-4 py-8">
        {scenes.length === 0 ? (
          <div className="max-w-3xl mx-auto space-y-8">
            <StoryPromptForm 
              onStoryGenerated={handleStoryGenerated}
              addDebugLog={addDebugLog}
            />
            <DebugConsole 
              logs={debugLogs} 
              onCopy={copyLogsToClipboard} 
              onClear={clearDebugLogs} 
            />
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <div className="space-y-6">
                {scenes.map((scene, index) => (
                  <SceneCard
                    key={scene.id}
                    scene={scene}
                    index={index}
                    totalScenes={scenes.length}
                    characterImage={characterImage}
                    characterImagePreview={characterImagePreview}
                    onUpdate={updateScene}
                    onDelete={deleteScene}
                    onMoveUp={moveSceneUp}
                    onMoveDown={moveSceneDown}
                    onImageUpload={handleImageUpload}
                    onNarrationGenerated={handleNarrationUpload}
                    onViewImage={setViewingImage}
                    addDebugLog={addDebugLog}
                  />
                ))}
              </div>
              <div className="text-center pt-8">
                <Button onClick={addNewScene}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Nova Cena
                </Button>
              </div>
            </div>

            <EditorSidebar
              videoQuality={videoQuality}
              onVideoQualityChange={setVideoQuality}
              characterImage={characterImage}
              characterImagePreview={characterImagePreview}
              onCharacterImageUpload={handleCharacterImageUpload}
              onCharacterImageRemove={() => {
                setCharacterImage(null);
                setCharacterImagePreview(null);
              }}
              backgroundMusic={backgroundMusic}
              backgroundMusicVolume={backgroundMusicVolume}
              onBackgroundMusicUpload={handleBackgroundMusicUpload}
              onBackgroundMusicRemove={() => setBackgroundMusic(null)}
              onBackgroundMusicVolumeChange={setBackgroundMusicVolume}
              logoFile={logoFile}
              logoPreview={logoPreview}
              logoPosition={logoPosition}
              onLogoUpload={handleLogoUpload}
              onLogoRemove={() => {
                setLogoFile(null);
                setLogoPreview(null);
              }}
              onLogoPositionChange={setLogoPosition}
              globalSrtFile={globalSrtFile}
              subtitleStyle={subtitleStyle}
              onSrtUpload={handleSrtUpload}
              onSrtRemove={() => setGlobalSrtFile(null)}
              onSubtitleStyleChange={(update) => setSubtitleStyle(prev => ({ ...prev, ...update }))}
              isProcessing={isProcessing}
              progress={progress}
              videoUrl={videoUrl}
              debugLogs={debugLogs}
              onDownloadVideo={downloadVideo}
              onCopyLogs={copyLogsToClipboard}
              onClearLogs={clearDebugLogs}
              onRender={handleRenderVideo}
              sceneCount={scenes.length}
            />
          </div>
        )}
      </main>

      <ViewImageModal
        isOpen={!!viewingImage}
        onClose={() => setViewingImage(null)}
        imageUrl={viewingImage}
      />
    </>
  );
};

export default Editor;