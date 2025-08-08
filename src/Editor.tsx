import { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Scene, useFFmpeg } from "@/hooks/useFFmpeg";
import { ImageGenerationModal } from "@/components/editor/ImageGenerationModal";
import { StoryPromptForm } from "@/components/editor/StoryPromptForm";
import { SceneCard } from "@/components/editor/SceneCard";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Bug, Clapperboard } from "lucide-react";
import { DebugLogModal } from "@/components/editor/DebugLogModal";
import { useScenes } from "./hooks/useScenes";
import { useGlobalSettings } from "./hooks/useGlobalSettings";
import { useProjectLoader } from "./hooks/useProjectLoader";
import { useProjectPersistence } from "./hooks/useProjectPersistence";
import { VideoProject } from "./types/video";
import { ProjectActions } from "./components/editor/ProjectActions";
import { RenderModal } from "./components/editor/RenderModal";
import { EditableProjectTitle } from "./components/editor/EditableProjectTitle";
import { DownloadModal, DownloadSelection } from "./components/editor/DownloadModal";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const Editor = () => {
  const location = useLocation();
  const { 
    renderVideo,
    concatenateAudio,
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
    subtitleStyle, setSubtitleStyle,
    zoomEffect, setZoomEffect,
    zoomIntensity, setZoomIntensity,
    addFade, setAddFade,
    fadeInDuration, setFadeInDuration,
    fadeOutDuration, setFadeOutDuration,
  } = useGlobalSettings();

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [persistedVideoUrl, setPersistedVideoUrl] = useState<string | null>(null);
  const [characterImage, setCharacterImage] = useState<File | null>(null);
  const [characterImagePreview, setCharacterImagePreview] = useState<string | null>(null);

  const { isProjectLoading } = useProjectLoader({
    onLoad: (project: VideoProject, loadedScenes: Scene[]) => {
      setScenes(loadedScenes);
      setCurrentProjectId(project.id);
      setProjectTitle(project.title);
      setPersistedVideoUrl(project.final_video_url);
    },
    addDebugLog
  });

  const { saveProject, updateProject, saveRenderedVideo } = useProjectPersistence(addDebugLog);
  
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [editingImageScene, setEditingImageScene] = useState<Scene | null>(null);
  const [isDebugModalOpen, setIsDebugModalOpen] = useState(false);
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
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
      setLocalVideoUrl(null);
      setPersistedVideoUrl(null);
      clearDebugLogs();
      addDebugLog("[Editor] Estado do editor resetado para o modo de criação.");
    }
  }, [location.state, setScenes, setGlobalSrtFile, setBackgroundMusic, setLogoFile, setLogoPreview, setCharacterImage, setCharacterImagePreview, clearDebugLogs, addDebugLog]);

  const handleRenderVideo = async () => {
    if (scenes.length === 0) {
      toast.error("Erro", { description: "Adicione pelo menos uma cena para renderizar" });
      return;
    }
    if (scenes.some(scene => !scene.image)) {
      toast.warning("Aviso", { description: "Todas as cenas precisam de uma imagem para renderizar." });
      return;
    }

    setIsRenderModalOpen(false);

    try {
      setLocalVideoUrl(null);
      clearDebugLogs();
      const result = await renderVideo(
        scenes, 
        globalSrtFile, 
        backgroundMusic, 
        subtitleStyle, 
        backgroundMusicVolume, 
        videoQuality, 
        logoFile, 
        logoPosition,
        zoomEffect,
        zoomIntensity,
        addFade,
        fadeInDuration,
        fadeOutDuration
      );
      if (result) {
        setLocalVideoUrl(result);
        toast.success("Sucesso!", { description: "Vídeo renderizado com sucesso" });
        if (currentProjectId) {
          const finalUrl = await saveRenderedVideo(currentProjectId, result);
          if (finalUrl) {
            setPersistedVideoUrl(finalUrl);
          }
        }
      } else {
        toast.error("Erro", { description: "Falha ao renderizar o vídeo" });
      }
    } catch (error) {
      toast.error("Erro na Renderização", { description: `${error}` });
    }
  };

  const handleDownload = async (selection: DownloadSelection) => {
    setIsDownloading(true);
    const finalVideoUrl = localVideoUrl || persistedVideoUrl;
    const zip = new JSZip();
    let filesToZip = 0;

    try {
      if (selection.video && finalVideoUrl) {
        const response = await fetch(finalVideoUrl);
        const blob = await response.blob();
        zip.file(`${projectTitle || 'video'}.mp4`, blob);
        filesToZip++;
      }

      if (selection.images) {
        const imagesFolder = zip.folder("images");
        for (let i = 0; i < scenes.length; i++) {
          if (scenes[i].image) {
            imagesFolder?.file(`image_${i + 1}.png`, scenes[i].image!);
            filesToZip++;
          }
        }
      }

      if (selection.audio) {
        const fullAudio = await concatenateAudio(scenes);
        if (fullAudio) {
          zip.file(fullAudio.name, fullAudio);
          filesToZip++;
        }
      }

      if (filesToZip > 1) {
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${projectTitle || 'projeto'}_assets.zip`);
      } else if (filesToZip === 1) {
        // If only one thing was selected, download it directly
        if (selection.video && finalVideoUrl) saveAs(finalVideoUrl, `${projectTitle || 'video'}.mp4`);
        if (selection.images) {
          const content = await zip.generateAsync({ type: "blob" });
          saveAs(content, `${projectTitle || 'projeto'}_images.zip`);
        }
        if (selection.audio) {
          const fullAudio = await concatenateAudio(scenes);
          if (fullAudio) saveAs(fullAudio, fullAudio.name);
        }
      } else {
        toast.info("Nenhum arquivo para baixar", { description: "Nenhum arquivo correspondente à sua seleção foi encontrado." });
      }

      if (filesToZip > 0) {
        toast.success("Download iniciado!");
      }
      
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Falha no Download", { description: "Ocorreu um erro ao preparar os arquivos." });
    } finally {
      setIsDownloading(false);
      setIsDownloadModalOpen(false);
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

  const handleSaveTitle = (newTitle: string) => {
    setProjectTitle(newTitle);
    if (currentProjectId) {
      updateProject(currentProjectId, { title: newTitle });
    }
  };

  if (isProjectLoading) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 text-lg text-muted-foreground">Carregando seu projeto...</p>
      </div>
    );
  }

  return (
    <>
      <div className="container max-w-screen-lg mx-auto px-4 h-full flex flex-col">
        {scenes.length === 0 ? (
          <div className="flex-grow flex items-center justify-center">
            <StoryPromptForm 
              onStoryGenerated={handleStoryGenerated}
              addDebugLog={addDebugLog}
            />
          </div>
        ) : (
          <>
            {/* Sticky Header */}
            <div className="flex-shrink-0 sticky top-[5.5rem] bg-muted z-10 pt-4 pb-4 border-b">
              <div className="flex items-center gap-4 mb-4">
                <Clapperboard className="w-8 h-8 text-primary" />
                <EditableProjectTitle initialTitle={projectTitle} onSave={handleSaveTitle} />
              </div>
              <ProjectActions 
                scenes={scenes}
                onRenderClick={() => setIsRenderModalOpen(true)}
                onDownloadClick={() => setIsDownloadModalOpen(true)}
                videoUrl={localVideoUrl || persistedVideoUrl}
              />
            </div>

            {/* Scrollable Scenes */}
            <div className="flex-1 overflow-y-auto space-y-6 py-6 pr-2 -mr-2">
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

            {/* Sticky Footer */}
            <div className="flex-shrink-0 sticky bottom-0 bg-background z-10 text-center py-4 border-t">
              <Button onClick={addNewScene}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Nova Cena
              </Button>
            </div>
          </>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 left-6 z-50 rounded-full h-12 w-12 shadow-lg bg-background/80 backdrop-blur-sm"
        onClick={() => setIsDebugModalOpen(true)}
        aria-label="Abrir logs de debug"
      >
        <Bug className="w-6 h-6" />
      </Button>

      <DebugLogModal
        isOpen={isDebugModalOpen}
        onClose={() => setIsDebugModalOpen(false)}
        logs={debugLogs}
        onCopy={copyLogsToClipboard}
        onClear={clearDebugLogs}
      />

      <ImageGenerationModal
        scene={editingImageScene}
        onClose={() => setEditingImageScene(null)}
        onImageGenerated={handleImageGenerated}
        onImageRemove={handleImageRemove}
        characterImage={characterImage}
        characterImagePreview={characterImagePreview}
        addDebugLog={addDebugLog}
      />

      <RenderModal
        isOpen={isRenderModalOpen}
        onClose={() => setIsRenderModalOpen(false)}
        onRender={handleRenderVideo}
        isProcessing={isProcessing}
        videoQuality={videoQuality}
        onVideoQualityChange={setVideoQuality}
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
        zoomEffect={zoomEffect}
        onZoomEffectChange={setZoomEffect}
        zoomIntensity={zoomIntensity}
        onZoomIntensityChange={setZoomIntensity}
        addFade={addFade}
        onAddFadeChange={setAddFade}
      />

      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onDownload={handleDownload}
        isDownloading={isDownloading || isProcessing}
        hasVideo={!!(localVideoUrl || persistedVideoUrl)}
        hasImages={scenes.some(s => s.image)}
        hasAudios={scenes.some(s => s.audio)}
      />
    </>
  );
};

export default Editor;