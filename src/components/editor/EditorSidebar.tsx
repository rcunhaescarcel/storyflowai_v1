import { GeneralSettings } from "./sidebar/GeneralSettings";
import { AssetSettings } from "./sidebar/AssetSettings";
import { SubtitleSettings } from "./sidebar/SubtitleSettings";
import { VisualEffectsSettings } from "./sidebar/VisualEffectsSettings";
import { ActionPanel } from "./sidebar/ActionPanel";
import { LogoPosition, SubtitleStyle } from "@/hooks/useFFmpeg";

type VideoQuality = "hd" | "fullhd";

interface EditorSidebarProps {
  projectTitle: string;
  onProjectTitleChange: (title: string) => void;
  videoQuality: VideoQuality;
  onVideoQualityChange: (quality: VideoQuality) => void;
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
  onDownloadVideo: () => void;
  onRender: () => void;
  onSaveProject: () => void;
  sceneCount: number;
  isEditing: boolean;
  addVisualEffects: boolean;
  onAddVisualEffectsChange: (add: boolean) => void;
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
          addVisualEffects={props.addVisualEffects}
          onAddVisualEffectsChange={props.onAddVisualEffectsChange}
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
        />
      </div>
    </aside>
  );
};