import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Clapperboard,
  Music,
  Volume2,
  FileText,
  Sparkles,
  Image as ImageIcon,
  Trash2,
  Move,
  Loader2,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
} from "lucide-react";
import { LogoPosition, SubtitleStyle } from "@/hooks/useFFmpeg";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorPicker } from "./render-settings/ColorPicker";

type ZoomEffect = "none" | "in" | "out" | "alternate";

interface RenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRender: () => void;
  isProcessing: boolean;
  
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
  
  subtitleStyle: SubtitleStyle;
  onSubtitleStyleChange: (style: Partial<SubtitleStyle>) => void;
  
  addFade: boolean;
  onAddFadeChange: (add: boolean) => void;

  generateSubtitles: boolean;
  onGenerateSubtitlesChange: (generate: boolean) => void;

  zoomEffect: ZoomEffect;
  onZoomEffectChange: (effect: ZoomEffect) => void;
  zoomIntensity: number;
  onZoomIntensityChange: (intensity: number) => void;
}

export const RenderModal = (props: RenderModalProps) => {
  const {
    isOpen, onClose, onRender, isProcessing,
    backgroundMusic, backgroundMusicVolume, onBackgroundMusicUpload, onBackgroundMusicRemove, onBackgroundMusicVolumeChange,
    logoFile, logoPreview, logoPosition, onLogoUpload, onLogoRemove, onLogoPositionChange,
    subtitleStyle, onSubtitleStyleChange,
    addFade, onAddFadeChange,
    generateSubtitles, onGenerateSubtitlesChange,
    zoomEffect, onZoomEffectChange, zoomIntensity, onZoomIntensityChange
  } = props;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl p-0 bg-[#1C1C1E] text-gray-100 border-gray-700">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-3 text-lg font-semibold">
            <Clapperboard className="w-5 h-5" />
            Criar vídeo
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 p-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Trilha Musical */}
            <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg">
              <h3 className="text-base font-semibold flex items-center gap-2 text-gray-300">
                <Music className="w-4 h-4" />
                Trilha musical
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onBackgroundMusicUpload(file);
                  }}
                  className="hidden"
                  id="modal-bg-music-upload"
                />
                <Button variant="outline" className="bg-gray-700/50 border-gray-600 hover:bg-gray-700" onClick={() => document.getElementById("modal-bg-music-upload")?.click()}>
                  <Music className="w-4 h-4 mr-2" />
                  {backgroundMusic ? "Trocar" : "Trilha"}
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="bg-gray-700/50 border-gray-600 hover:bg-gray-700" disabled={!backgroundMusic}>
                      <Volume2 className="w-4 h-4 mr-2" />
                      Volume
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2 bg-gray-800 border-gray-700">
                    <Slider
                      value={[backgroundMusicVolume]}
                      onValueChange={(value) => onBackgroundMusicVolumeChange(value[0])}
                      max={1} min={0} step={0.05}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Efeitos */}
            <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg">
              <h3 className="text-base font-semibold flex items-center gap-2 text-gray-300">
                <Sparkles className="w-4 h-4" />
                Efeitos
              </h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="fade-transition">Transição Fade</Label>
                <Switch id="fade-transition" checked={addFade} onCheckedChange={onAddFadeChange} />
              </div>
              <div className="space-y-2">
                <Label>Efeito de Zoom</Label>
                <Select value={zoomEffect} onValueChange={onZoomEffectChange}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600">
                    <SelectValue placeholder="Selecione um efeito" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="none">Nenhum</SelectItem>
                    <SelectItem value="in">Zoom In</SelectItem>
                    <SelectItem value="out">Zoom Out</SelectItem>
                    <SelectItem value="alternate">Alternado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {zoomEffect !== 'none' && (
                <div className="space-y-2">
                  <Label>Intensidade do Zoom ({zoomIntensity}%)</Label>
                  <Slider
                    value={[zoomIntensity]}
                    onValueChange={(value) => onZoomIntensityChange(value[0])}
                    max={50} min={5} step={1}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Legenda */}
            <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg">
              <h3 className="text-base font-semibold flex items-center gap-2 text-gray-300">
                <FileText className="w-4 h-4" />
                Legenda
              </h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="generate-subtitles">Gerar legendas</Label>
                <Switch id="generate-subtitles" checked={generateSubtitles} onCheckedChange={onGenerateSubtitlesChange} />
              </div>
              <div className="mt-2 space-y-2">
                <Label>Cor da Legenda</Label>
                <ColorPicker
                  value={subtitleStyle.fontColor}
                  onChange={(color) => onSubtitleStyleChange({ fontColor: color })}
                  disabled={!generateSubtitles}
                />
              </div>
            </div>

            {/* Logo */}
            <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg flex flex-col">
              <h3 className="text-base font-semibold flex items-center gap-2 text-gray-300">
                <ImageIcon className="w-4 h-4" />
                Logo
              </h3>
              <Input type="file" accept="image/*" onChange={onLogoUpload} className="hidden" id="modal-logo-upload" />
              <div
                className="relative w-full h-32 mt-2 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700/50"
                onClick={() => document.getElementById("modal-logo-upload")?.click()}
              >
                {logoPreview ? (
                  <>
                    <img src={logoPreview} alt="Logo Preview" className="max-h-24 object-contain p-2" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={(e) => { e.stopPropagation(); onLogoRemove(); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <span className="text-gray-400">Clique para adicionar seu logo</span>
                )}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full mt-4 bg-gray-700/50 border-gray-600 hover:bg-gray-700" disabled={!logoFile}>
                    <Move className="w-4 h-4 mr-2" /> Posição
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-1 bg-gray-800 border-gray-700">
                  <ToggleGroup
                    type="single"
                    value={logoPosition}
                    onValueChange={(v) => { if (v) onLogoPositionChange(v as LogoPosition); }}
                    className="text-white"
                  >
                    <ToggleGroupItem value="top-left" className="hover:bg-gray-700 data-[state=on]:bg-primary"><CornerUpLeft /></ToggleGroupItem>
                    <ToggleGroupItem value="top-right" className="hover:bg-gray-700 data-[state=on]:bg-primary"><CornerUpRight /></ToggleGroupItem>
                    <ToggleGroupItem value="bottom-left" className="hover:bg-gray-700 data-[state=on]:bg-primary"><CornerDownLeft /></ToggleGroupItem>
                    <ToggleGroupItem value="bottom-right" className="hover:bg-gray-700 data-[state=on]:bg-primary"><CornerDownRight /></ToggleGroupItem>
                  </ToggleGroup>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        
        <DialogFooter className="p-4 bg-black/30">
          <Button onClick={onRender} disabled={isProcessing} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-6 text-base">
            {isProcessing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {isProcessing ? 'Criando...' : 'Criar vídeo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};