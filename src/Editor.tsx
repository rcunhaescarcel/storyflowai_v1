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
import { RenderProgress } from "./components/editor/RenderProgress";
import { cn } from "./lib/utils";
import { useRender } from "./contexts/RenderContext";

const generateSrtFromScenes = (scenes: Scene[]): string => {
  let srtContent = '';
  let currentTime = 0;
  scenes.forEach((scene, index) => {
    if (scene.narrationText && scene.duration) {
      const startTime = currentTime;
      const endTime = currentTime + scene.duration;
      
      const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        const ms = ((seconds % 1) * 1000).toFixed(0).toString().padStart(3, '0');
        return `${h}:${m}:${s},${ms}`;
      };

      srtContent += `${index + 1}\n`;
      srtContent += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
      srtContent += `${scene.narrationText.trim()}\n\n`;

      currentTime = endTime;
    }
  });
  return srtContent;
};

const Editor = () => {
  const location = useLocation();
  const { 
    renderVideo,
    concatenateAudio,
    cancelRender,
  } = useFFmpeg();

  const { 
    isRendering, 
    progress, 
    stage, 
    debugLogs, 
    clearLogs, 
    addLog,
    startRender,
    renderingProjectId
  } = useRender();

  const addDebugLog = useCallback((message: string) => {
    addLog(`[${new Date().toLocaleTimeString()}] ${message}`);
  }, [addLog]);

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
    backgroundMusic, handleBackgroundMusicUpload, setBackgroundMusic,
    backgroundMusicVolume, setBackgroundMusicVolume,
    logoFile, logoPreview, handleLogoUpload, setLogoFile, setLogoPreview,
    logoPosition, setLogoPosition,
    subtitleStyle, setSubtitleStyle,
    addFade, setAddFade,
    generateSubtitles, setGenerateSubtitles,
    zoomEffect, setZoomEffect,
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
    const state = location.state as { project?: VideoProject, resumeRender?: boolean } | null;
    if (!state?.project && !state?.resumeRender) {
      setScenes([]);
      setCurrentProjectId(null);
      setProjectTitle('');
      setBackgroundMusic(null);
      setLogoFile(null);
      setLogoPreview(null);
      setCharacterImage(null);
      setCharacterImagePreview(null);
      setLocalVideoUrl(null);
      setPersistedVideoUrl(null);
      clearLogs();
      addDebugLog("[Editor] Estado do editor resetado para o modo de criação.");
    }
  }, [location.state, setScenes, setBackgroundMusic, setLogoFile, setLogoPreview, setCharacterImage, setCharacterImagePreview, clearLogs, addDebugLog]);

  const handleRenderVideo = async () => {
    if (scenes.length === 0) {
      toast.error("Erro", { description: "Adicione pelo menos uma cena para renderizar" });
      return;
    }
    if (scenes.some(scene => !scene.image)) {
      toast.warning("Aviso", { description: "Todas as cenas precisam de uma imagem para renderizar." });
      return;
    }
    if (!currentProjectId) {
      toast.error("Erro", { description: "ID do projeto não encontrado. Salve o projeto primeiro." });
      return;
    }

    setIsRenderModalOpen(false);
    startRender(currentProjectId);

    let srtFileToRender: File | null = null;
    if (generateSubtitles) {
      const srtContent = generateSrtFromScenes(scenes);
      if (srtContent) {
        srtFileToRender = new File([srtContent], "generated.srt", { type: "text/plain" });
        addDebugLog("[Legendas] Arquivo SRT gerado a partir das narrações.");
      } else {
        addDebugLog("[Legendas] Nenhuma narração encontrada para gerar legendas.");
      }
    }

    try {
      setLocalVideoUrl(null);
      const result = await renderVideo(
        scenes, 
        srtFileToRender, 
        backgroundMusic, 
        subtitleStyle, 
        backgroundMusicVolume, 
        'fullhd',
        logoFile, 
        logoPosition,
        zoomEffect,
        addFade,
        0.5,
        0.5
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
      } else if (!isRendering) { // Only show error if not cancelled
        toast.error("Erro", { description: "Falha ao renderizar o vídeo" });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      if (message.includes('cancelada')) {
        toast.info("Renderização Cancelada", { description: "O processo foi interrompido." });
      } else {
        toast.error("Erro na Renderização", { description: message });
      }
    }
  };

  const handleDownload = async (selection: DownloadSelection) => {
    setIsDownloading(true);
    const finalVideoUrl = persistedVideoUrl || localVideoUrl;
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

  const handleStoryGenerated = useCallback(async (newScenes: Scene[], generatedTitle: string, characterFile?: File, characterPreview?: string, projectPrompt?: string, projectStyle?: string) => {
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
      const newProject = await saveProject(newScenes, generatedTitle, projectPrompt, projectStyle);
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
      <main className="container max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="mt-4 text-lg text-muted-foreground">Carregando seu projeto...</p>
        </div>
      </main>
    );
  }

  const showRenderProgress = isRendering && renderingProjectId === currentProjectId;
  const finalVideoUrl = persistedVideoUrl || localVideoUrl;

  return (
    <>
      <main className="container max-w-screen-lg mx-auto px-4 py-8">
        {scenes.length === 0 && !showRenderProgress ? (
          <div className="max-w-3xl mx-auto space-y-8">
            <StoryPromptForm 
              onStoryGenerated={handleStoryGenerated}
              addDebugLog={addDebugLog}
            />
          </div>
        ) : showRenderProgress ? (
          <RenderProgress stage={stage} progress={progress} onCancel={cancelRender} />
        ) : (
          <div className="mt-8">
            <div className="flex items-center gap-4 mb-4">
              <Clapperboard className="w-8 h-8 text-primary" />
              <EditableProjectTitle initialTitle={projectTitle} onSave={handleSaveTitle} />
            </div>
            <div className="mb-8">
              <ProjectActions 
                scenes={scenes}
                onRenderClick={() => setIsRenderModalOpen(true)}
                onDownloadClick={() => setIsDownloadModalOpen(true)}
                videoUrl={finalVideoUrl}
              />
            </div>
            <div className={cn("grid gap-8", finalVideoUrl && "md:grid-cols-2")}>
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
                <div className="text-center pt-2">
                  <Button onClick={addNewScene}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Nova Cena
                  </Button>
                </div>
              </div>
              {finalVideoUrl && (
                <div className="sticky top-24 h-min">
                  <video
                    key={finalVideoUrl}
                    src={finalVideoUrl}
                    controls
                    className="w-full rounded-lg shadow-lg aspect-video bg-black"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

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
        onClear={clearLogs}
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
        isProcessing={isRendering}
        backgroundMusic={backgroundMusic}
        backgroundMusicVolume={backgroundMusicVolume}
        onBackgroundMusicUpload={handleBackgroundMusicUpload}
        onBackgroundMusicRemove={() => setBackgroundMusic(null)}
        onBackgroundMusicVolumeChange={setBackgroundMusicVolume}
        onLogoUpload={handleLogoUpload}
        onLogoRemove={() => {
          setLogoFile(null);
          setLogoPreview(null);
        }}
        logoFile={logoFile}
        logoPreview={logoPreview}
        logoPosition={logoPosition}
        onLogoPositionChange={setLogoPosition}
        subtitleStyle={subtitleStyle}
        onSubtitleStyleChange={(update) => setSubtitleStyle(prev => ({ ...prev, ...update }))}
        addFade={addFade}
        onAddFadeChange={setAddFade}
        generateSubtitles={generateSubtitles}
        onGenerateSubtitlesChange={setGenerateSubtitles}
        zoomEffect={zoomEffect}
        onZoomEffectChange={setZoomEffect}
      />

      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onDownload={handleDownload}
        isDownloading={isDownloading || isRendering}
        hasVideo={!!(localVideoUrl || persistedVideoUrl)}
        hasImages={scenes.some(s => s.image)}
        hasAudios={scenes.some(s => s.audio)}
      />
    </>
  );
};

export default Editor;