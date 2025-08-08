import { GeneralSettings } from "./sidebar/GeneralSettings";
import { AssetSettings } from "./sidebar/AssetSettings";
import { SubtitleSettings } from "./sidebar/SubtitleSettings";
import { VisualEffectsSettings } from "./sidebar/VisualEffectsSettings";
import { ActionPanel } from "./sidebar/ActionPanel";
import { LogoPosition, SubtitleStyle } from "@/hooks/useFFmpeg";

type VideoQuality = "hd" | "fullhd";
type ZoomEffect = "none" | "in" | "out" | "alternate";

interface EditorSidebarProps {
  projectTitle: string;
  onProjectTitleChange: (title: string) => void;
  videoQuality: VideoQuality;
  onVideoQualityChange: (quality: VideoQuality) => void;
  characterImage: File | null;
  characterImagePreview: string | null;
  onCharacterImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCharacterImageRemove: () => void;
  backgroundMusic: File | null;
  backgroundMusicVolume: number;
  onBackgroundMusicUpload: (file: File) => void;
  onBackgroundMusicRemove: () => void;
  onBackgroundMusicVolumeChange: (volume: number) => void;
  logoFile: File | null;
  logoPreview: string | null;
  logoPosition: LogoPosition;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoRemove: () => void;
  onLogoPositionChange: (position: LogoPosition) => void;
  globalSrtFile: File | null;
  subtitleStyle: SubtitleStyle;
  onSrtUpload: (file: File) => void;
  onSrtRemove: () => void;
  onSubtitleStyleChange: (style: Partial<SubtitleStyle>) => void;
  isProcessing: boolean;
  isSaving: boolean;
  progress: number;
  videoUrl: string | null;
  debugLogs: string[];
  onDownloadVideo: () => void;
  onCopyLogs: () => void;
  onClearLogs: () => void;
  onRender: () => void;
  onSaveProject: () => void;
  sceneCount: number;
  isEditing: boolean;
  zoomEffect: ZoomEffect;
  onZoomEffectChange: (effect: ZoomEffect) => void;
  zoomIntensity: number;
  onZoomIntensityChange: (intensity: number) => void;
  addFade: boolean;
  onAddFadeChange: (add: boolean) => void;
  fadeInDuration: number;
  onFadeInDurationChange: (duration: number) => void;
  fadeOutDuration: number;
  onFadeOutDurationChange: (duration: number) => void;
}

export const EditorSidebar = (props: EditorSidebarProps) => {
  return (
    <aside className="lg:col-span-4 space-y-8">
      <div className="sticky top-24 space-y-8">
        <GeneralSettings
          isEditing={props.isEditing}
          projectTitle={props.projectTitle}
          onProjectTitleChange={props.onProjectTitleChange}
          videoQuality={props.videoQuality}
          onVideoQualityChange={props.onVideoQualityChange}
        />
        <AssetSettings
          characterImage={props.characterImage}
          characterImagePreview={props.characterImagePreview}
          onCharacterImageUpload={props.onCharacterImageUpload}
          onCharacterImageRemove={props.onCharacterImageRemove}
          backgroundMusic={props.backgroundMusic}
          backgroundMusicVolume={props.backgroundMusicVolume}
          onBackgroundMusicUpload={props.onBackgroundMusicUpload}
          onBackgroundMusicRemove={props.onBackgroundMusicRemove}
          onBackgroundMusicVolumeChange={props.onBackgroundMusicVolumeChange}
          logoFile={props.logoFile}
          logoPreview={props.logoPreview}
          logoPosition={props.logoPosition}
          onLogoUpload={props.onLogoUpload}
          onLogoRemove={props.onLogoRemove}
          onLogoPositionChange={props.onLogoPositionChange}
        />
        <SubtitleSettings
          globalSrtFile={props.globalSrtFile}
          onSrtUpload={props.onSrtUpload}
          onSrtRemove={props.onSrtRemove}
          subtitleStyle={props.subtitleStyle}
          onSubtitleStyleChange={props.onSubtitleStyleChange}
        />
        <VisualEffectsSettings
          zoomEffect={props.zoomEffect}
          onZoomEffectChange={props.onZoomEffectChange}
          zoomIntensity={props.zoomIntensity}
          onZoomIntensityChange={props.onZoomIntensityChange}
          addFade={props.addFade}
          onAddFadeChange={props.onAddFadeChange}
          fadeInDuration={props.fadeInDuration}
          onFadeInDurationChange={props.onFadeInDurationChange}
          fadeOutDuration={props.fadeOutDuration}
          onFadeOutDurationChange={props.onFadeOutDurationChange}
        />
        <ActionPanel
          isEditing={props.isEditing}
          onSaveProject={props.onSaveProject}
          isSaving={props.isSaving}
          isProcessing={props.isProcessing}
          onRender={props.onRender}
          sceneCount={props.sceneCount}
          progress={props.progress}
          videoUrl={props.videoUrl}
          onDownloadVideo={props.onDownloadVideo}
          debugLogs={props.debugLogs}
          onCopyLogs={props.onCopyLogs}
          onClearLogs={props.onClearLogs}
        />
      </div>
    </aside>
  );
};