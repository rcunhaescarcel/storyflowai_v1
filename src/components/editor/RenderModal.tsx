import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GeneralSettings } from "./render-settings/GeneralSettings";
import { AssetSettings } from "./render-settings/AssetSettings";
import { SubtitleSettings } from "./render-settings/SubtitleSettings";
import { VisualEffectsSettings } from "./render-settings/VisualEffectsSettings";
import { TransitionSettings } from "./render-settings/TransitionSettings";
import { LogoPosition, SubtitleStyle } from "@/hooks/useFFmpeg";
import { Loader2, Video } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type VideoQuality = "hd" | "fullhd";
type ZoomEffect = "none" | "in" | "out" | "alternate";

interface RenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRender: () => void;
  isProcessing: boolean;
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
  zoomEffect: ZoomEffect;
  onZoomEffectChange: (effect: ZoomEffect) => void;
  zoomIntensity: number;
  onZoomIntensityChange: (intensity: number) => void;
  addFade: boolean;
  onAddFadeChange: (add: boolean) => void;
}

export const RenderModal = (props: RenderModalProps) => {
  return (
    <Dialog open={props.isOpen} onOpenChange={props.onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Configurações de Renderização</DialogTitle>
          <DialogDescription>
            Ajuste as opções finais antes de criar seu vídeo.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <div className="space-y-6">
              <GeneralSettings
                videoQuality={props.videoQuality}
                onVideoQualityChange={props.onVideoQualityChange}
              />
              <SubtitleSettings
                globalSrtFile={props.globalSrtFile}
                onSrtUpload={props.onSrtUpload}
                onSrtRemove={props.onSrtRemove}
                subtitleStyle={props.subtitleStyle}
                onSubtitleStyleChange={props.onSubtitleStyleChange}
              />
            </div>
            <div className="space-y-6">
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
              <TransitionSettings
                addFade={props.addFade}
                onAddFadeChange={props.onAddFadeChange}
              />
              <VisualEffectsSettings
                zoomEffect={props.zoomEffect}
                onZoomEffectChange={props.onZoomEffectChange}
                zoomIntensity={props.zoomIntensity}
                onZoomIntensityChange={props.onZoomIntensityChange}
              />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={props.onClose} disabled={props.isProcessing}>
            Cancelar
          </Button>
          <Button onClick={props.onRender} disabled={props.isProcessing}>
            {props.isProcessing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Video className="w-4 h-4 mr-2" />
            )}
            {props.isProcessing ? 'Renderizando...' : 'Renderizar Vídeo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};