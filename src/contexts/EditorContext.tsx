import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Scene, VideoFormat, SubtitleStyle, LogoPosition } from '@/hooks/useFFmpeg';
import { VideoProject } from '@/types/video';
import { useScenes } from '@/hooks/useScenes';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';
import { useProjectPersistence } from '@/hooks/useProjectPersistence';
import { useProjectLoader } from '@/hooks/useProjectLoader';
import { useRender } from './RenderContext';

type ZoomEffect = "none" | "in" | "out" | "alternate";

interface EditorContextType {
  // Scenes
  scenes: Scene[];
  setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
  addNewScene: () => void;
  updateScene: (id: string, updates: Partial<Scene>) => void;
  deleteScene: (id: string) => void;
  moveSceneUp: (index: number) => void;
  moveSceneDown: (index: number) => void;
  handleImageGenerated: (sceneId: string, file: File, prompt: string) => void;
  handleImageRemove: (sceneId: string) => void;
  handleNarrationUpload: (sceneId: string, file: File, dataUrl: string) => void;

  // Global Settings
  backgroundMusic: File | null;
  handleBackgroundMusicUpload: (file: File) => void;
  setBackgroundMusic: React.Dispatch<React.SetStateAction<File | null>>;
  backgroundMusicVolume: number;
  setBackgroundMusicVolume: React.Dispatch<React.SetStateAction<number>>;
  logoFile: File | null;
  logoPreview: string | null;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setLogoFile: React.Dispatch<React.SetStateAction<File | null>>;
  setLogoPreview: React.Dispatch<React.SetStateAction<string | null>>;
  logoPosition: LogoPosition;
  setLogoPosition: React.Dispatch<React.SetStateAction<LogoPosition>>;
  subtitleStyle: SubtitleStyle;
  setSubtitleStyle: React.Dispatch<React.SetStateAction<SubtitleStyle>>;
  addFade: boolean;
  setAddFade: React.Dispatch<React.SetStateAction<boolean>>;
  generateSubtitles: boolean;
  setGenerateSubtitles: React.Dispatch<React.SetStateAction<boolean>>;
  zoomEffect: ZoomEffect;
  setZoomEffect: React.Dispatch<React.SetStateAction<ZoomEffect>>;

  // Project State
  currentProject: VideoProject | null;
  setCurrentProject: React.Dispatch<React.SetStateAction<VideoProject | null>>;
  characterImage: File | null;
  setCharacterImage: React.Dispatch<React.SetStateAction<File | null>>;
  characterImagePreview: string | null;
  setCharacterImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
  videoFormat: VideoFormat;
  setVideoFormat: React.Dispatch<React.SetStateAction<VideoFormat>>;
  isProjectLoading: boolean;

  // Persistence
  saveProject: (scenesToSave: Scene[], projectTitle: string, projectDescription: string, projectStyle?: string, videoFormat?: "landscape" | "portrait") => Promise<VideoProject | null>;
  updateProject: (projectId: string, updates: Partial<VideoProject>) => Promise<void>;
  saveRenderedVideo: (projectId: string, videoBlobUrl: string) => Promise<string | null>;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const { addLog } = useRender();
  const addDebugLog = useCallback((message: string) => {
    addLog(`[${new Date().toLocaleTimeString()}] ${message}`);
  }, [addLog]);

  const {
    scenes, setScenes, addNewScene, updateScene, deleteScene, moveSceneUp, moveSceneDown,
    handleImageGenerated, handleImageRemove, handleNarrationUpload,
  } = useScenes();

  const globalSettings = useGlobalSettings();

  const [currentProject, setCurrentProject] = useState<VideoProject | null>(null);
  const [characterImage, setCharacterImage] = useState<File | null>(null);
  const [characterImagePreview, setCharacterImagePreview] = useState<string | null>(null);
  const [videoFormat, setVideoFormat] = useState<VideoFormat>('landscape');

  const { isProjectLoading } = useProjectLoader({
    onLoad: (project, loadedScenes, format) => {
      setScenes(loadedScenes);
      setCurrentProject(project);
      setVideoFormat(format);
    },
    addDebugLog,
  });

  const persistence = useProjectPersistence(addDebugLog);

  const value = {
    scenes, setScenes, addNewScene, updateScene, deleteScene, moveSceneUp, moveSceneDown,
    handleImageGenerated, handleImageRemove, handleNarrationUpload,
    ...globalSettings,
    currentProject, setCurrentProject,
    characterImage, setCharacterImage,
    characterImagePreview, setCharacterImagePreview,
    videoFormat, setVideoFormat,
    isProjectLoading,
    ...persistence,
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};