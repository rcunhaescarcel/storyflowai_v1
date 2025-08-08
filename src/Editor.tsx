import { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Scene, useFFmpeg } from "@/hooks/useFFmpeg";
import { ImageGenerationModal } from "@/components/editor/ImageGenerationModal";
import { StoryPromptForm } from "@/components/editor/StoryPromptForm";
import { SceneCard } from "@/components/editor/SceneCard";
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { DebugConsole } from "@/components/editor/DebugConsole";
import { useScenes } from "./hooks/useScenes";
import { useGlobalSettings } from "./hooks/useGlobalSettings";
import { useProjectLoader } from "./hooks/useProjectLoader";
import { useProjectPersistence } from "./hooks/useProjectPersistence";
import { VideoProject } from "./types/video";

const Editor = () => {
  const location = useLocation();
  const { 
    renderVideo, 
    isProcessing, 
    progress, 
    debugLogs, 
    clearDebugLogs,
    addDebugLog
  } = useFFmpeg();

  const {
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
  } = useScenes();

  const {
    globalSrtFile, handleSrtUpload, setGlobalSrtFile,
    backgroundMusic, handleBackgroundMusicUpload, setBackgroundMusic,
    backgroundMusicVolume, setBackgroundMusicVolume,
    videoQuality, setVideoQuality,
    logoFile, logoPreview, handleLogoUpload, setLogoFile, setLogoPreview,
    logoPosition, setLogoPosition,
    characterImage, characterImagePreview, handleCharacterImageUpload, setCharacterImage, setCharacterImagePreview,
    subtitleStyle, setSubtitleStyle
  } = useGlobalSettings();

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState<string>('');

  const { isProjectLoading } = useProjectLoader({
    onLoad: (project: VideoProject, loadedScenes: Scene[]) => {
      setScenes(loadedScenes);
      setCurrentProjectId(project.id);
      setProjectTitle(project.title);
    },
    addDebugLog
  });

  const { saveProject, updateProject, isSaving } = useProjectPersistence(addDebugLog);
  
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [editingImageScene, setEditingImageScene] = useState<Scene | null>(null);

  useEffect(() => {
    // Se não houver um projeto no estado da localização, resete o editor.
    // Isso garante que clicar em "Criar" limpe um projeto que estava sendo editado.
    if (!location.state?.project) {
      setScenes([]);
      setCurrentProjectId(null);
      setProjectTitle('');
      setGlobalSrtFile(null);
      setBackgroundMusic(null);
      setLogoFile(null);
      setLogoPreview(null);
      setCharacterImage(null);
      setCharacterImagePreview(null);
      setVideoUrl(null);
      clearDebugLogs();
      addDebugLog("[Editor] Estado do editor resetado para o modo de criação.");
    }
  // A dependência é location.state, então isso roda sempre que o estado de navegação muda.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

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
      const result = await renderVideo(
        scenes, 
        globalSrtFile, 
        backgroundMusic, 
        subtitleStyle, 
        backgroundMusicVolume, 
        videoQuality, 
        logoFile, 
        logoPosition
      );
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

  const handleSaveProject = () => {
    if (!currentProjectId) {
      toast.error("ID do projeto não encontrado para salvar.");
      return;
    }
    updateProject(currentProjectId, scenes, projectTitle);
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

  const handleStoryGenerated = useCallback(async (newScenes: Scene[], characterFile?: File, characterPreview?: string, projectPrompt?: string, projectStyle?: string) => {
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
      const newProject = await saveProject(newScenes, projectPrompt, projectStyle);
      if (newProject) {
        setCurrentProjectId(newProject.id);
        setProjectTitle(newProject.title);
      }
    }
  }, [setScenes, setCharacterImage, setCharacterImagePreview, addDebugLog, saveProject]);

  if (isProjectLoading) {
    return (
      <main className="container max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="mt-4 text-lg text-muted-foreground">Carregando seu projeto...</p>
        </div>
      </main>
    );
  }

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
          <div className="grid lg:grid-cols-12 gap-8 mt-8">
            <div className="lg:col-span-8">
              <div className="space-y-6">
                {scenes.map((scene, index) => (
                  <SceneCard
                    key={scene.id}
                    scene={scene}
                    index={index}
                    totalScenes={scenes.length}
                    onUpdate={updateScene}
                    onDelete={deleteScene}
                    onMoveUp={moveSceneUp}
                    onMoveDown={moveSceneDown}
                    onNarrationGenerated={handleNarrationUpload}
                    onEditImage={setEditingImageScene}
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
              projectTitle={projectTitle}
              onProjectTitleChange={setProjectTitle}
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
              isSaving={isSaving}
              progress={progress}
              videoUrl={videoUrl}
              debugLogs={debugLogs}
              onDownloadVideo={downloadVideo}
              onCopyLogs={copyLogsToClipboard}
              onClearLogs={clearDebugLogs}
              onRender={handleRenderVideo}
              onSaveProject={handleSaveProject}
              sceneCount={scenes.length}
              isEditing={!!currentProjectId}
            />
          </div>
        )}
      </main>

      <ImageGenerationModal
        scene={editingImageScene}
        onClose={() => setEditingImageScene(null)}
        onImageGenerated={handleImageGenerated}
        onImageRemove={handleImageRemove}
        characterImage={characterImage}
        characterImagePreview={characterImagePreview}
        addDebugLog={addDebugLog}
      />
    </>
  );
};

export default Editor;