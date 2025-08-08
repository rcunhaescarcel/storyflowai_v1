import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  Play,
  Pause,
  CheckCircle,
} from "lucide-react";
import { LogoPosition, SubtitleStyle } from "@/hooks/useFFmpeg";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorPicker } from "./render-settings/ColorPicker";
import { urlToFile } from "@/lib/imageUtils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

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
}

const musicTracks = [
  { name: "Power of Prosperity", url: "https://0eeb6b826f9e83756195697eae0f522e.cdn.bubble.io/f1749857199070x718181362623514800/trilha_Power%20of%20Prosperity.mp3" },
  { name: "Inspiring Journey", url: "https://0eeb6b826f9e83756195697eae0f522e.cdn.bubble.io/f1749857492379x101851021095338000/trilha_Inspiring%20Journey.mp3" },
  { name: "Playful Whimsy", url: "https://0eeb6b826f9e83756195697eae0f522e.cdn.bubble.io/f1749857558889x122515034895358370/trilha_Playful%20Whimsy.mp3" },
];

export const RenderModal = (props: RenderModalProps) => {
  const {
    isOpen, onClose, onRender, isProcessing,
    backgroundMusic, backgroundMusicVolume, onBackgroundMusicUpload, onBackgroundMusicRemove, onBackgroundMusicVolumeChange,
    logoFile, logoPreview, logoPosition, onLogoUpload, onLogoRemove, onLogoPositionChange,
    subtitleStyle, onSubtitleStyleChange,
    addFade, onAddFadeChange,
    generateSubtitles, onGenerateSubtitlesChange,
    zoomEffect, onZoomEffectChange
  } = props;

  const audioRef = useRef<HTMLAudioElement>(null);
  const [playingTrackUrl, setPlayingTrackUrl] = useState<string | null>(null);
  const [selectingTrackUrl, setSelectingTrackUrl] = useState<string | null>(null);

  const handlePlayToggle = (url: string) => {
    if (audioRef.current) {
      if (playingTrackUrl === url) {
        audioRef.current.pause();
        setPlayingTrackUrl(null);
      } else {
        audioRef.current.src = url;
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        setPlayingTrackUrl(url);
      }
    }
  };

  const handleSelectTrack = async (track: typeof musicTracks[0]) => {
    if (backgroundMusic?.name === `${track.name}.mp3`) {
      onBackgroundMusicRemove();
      return;
    }

    setSelectingTrackUrl(track.url);
    try {
      const file = await urlToFile(track.url, `${track.name}.mp3`, 'audio/mp3');
      onBackgroundMusicUpload(file);
    } catch (error) {
      toast.error("Falha ao carregar a trilha sonora.");
      console.error(error);
    } finally {
      setSelectingTrackUrl(null);
    }
  };

  useEffect(() => {
    const audioElement = audioRef.current;
    const onEnded = () => setPlayingTrackUrl(null);
    audioElement?.addEventListener('ended', onEnded);
    return () => {
      audioElement?.removeEventListener('ended', onEnded);
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-3 text-lg font-semibold">
            <Clapperboard className="w-5 h-5 text-primary" />
            Criar vídeo
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 px-6 pb-6 pt-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Efeitos */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h3 className="text-base font-semibold flex items-center gap-2 text-foreground">
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
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um efeito" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    <SelectItem value="in">Zoom In</SelectItem>
                    <SelectItem value="out">Zoom Out</SelectItem>
                    <SelectItem value="alternate">Alternado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Legenda */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h3 className="text-base font-semibold flex items-center gap-2 text-foreground">
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
          </div>

          {/* Right Column */}
          <div className="space-y-6 flex flex-col">
            {/* Trilha Musical */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h3 className="text-base font-semibold flex items-center gap-2 text-foreground">
                <Music className="w-4 h-4" />
                Trilha musical
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="secondary" className="w-full justify-start truncate">
                      <Music className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {backgroundMusic ? backgroundMusic.name.replace('.mp3', '').replace(/_/g, ' ') : "Escolher Trilha"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-2">
                    <div className="space-y-1">
                      {musicTracks.map((track) => {
                        const isSelected = backgroundMusic?.name === `${track.name}.mp3`;
                        const isSelecting = selectingTrackUrl === track.url;
                        const isPlaying = playingTrackUrl === track.url;

                        return (
                          <div key={track.url} className="flex items-center justify-between gap-2 p-1 rounded-md hover:bg-muted">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="w-8 h-8 flex-shrink-0"
                                onClick={(e) => { e.stopPropagation(); handlePlayToggle(track.url); }}
                              >
                                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </Button>
                              <span className="text-sm font-medium truncate" title={track.name}>{track.name}</span>
                            </div>
                            <Button
                              size="sm"
                              variant={isSelected ? "secondary" : "outline"}
                              onClick={() => handleSelectTrack(track)}
                              disabled={isSelecting}
                              className="w-20 flex-shrink-0"
                            >
                              {isSelecting ? <Loader2 className="w-4 h-4 animate-spin" /> : isSelected ? <CheckCircle className="w-4 h-4" /> : "Usar"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="secondary" disabled={!backgroundMusic}>
                      <Volume2 className="w-4 h-4 mr-2" />
                      Volume
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2">
                    <Slider
                      value={[backgroundMusicVolume]}
                      onValueChange={(value) => onBackgroundMusicVolumeChange(value[0])}
                      max={1} min={0} step={0.05}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {backgroundMusic && (
                <Button variant="outline" size="sm" className="w-full" onClick={onBackgroundMusicRemove}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover Trilha Sonora
                </Button>
              )}
            </div>

            {/* Logo */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg flex-1 flex flex-col">
              <h3 className="text-base font-semibold flex items-center gap-2 text-foreground">
                <ImageIcon className="w-4 h-4" />
                Logo
              </h3>
              <Input type="file" accept="image/*" onChange={onLogoUpload} className="hidden" id="modal-logo-upload" />
              <div
                className="relative w-full mt-2 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:bg-accent flex-1"
                onClick={() => document.getElementById("modal-logo-upload")?.click()}
              >
                {logoPreview ? (
                  <>
                    <img src={logoPreview} alt="Logo Preview" className="max-h-full object-contain p-2" />
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
                  <span className="text-muted-foreground">Clique para adicionar seu logo</span>
                )}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="secondary" className="w-full mt-4" disabled={!logoFile}>
                    <Move className="w-4 h-4 mr-2" /> Posição
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-1">
                  <ToggleGroup
                    type="single"
                    value={logoPosition}
                    onValueChange={(v) => { if (v) onLogoPositionChange(v as LogoPosition); }}
                  >
                    <ToggleGroupItem value="top-left" aria-label="Topo Esquerda"><CornerUpLeft /></ToggleGroupItem>
                    <ToggleGroupItem value="top-right" aria-label="Topo Direita"><CornerUpRight /></ToggleGroupItem>
                    <ToggleGroupItem value="bottom-left" aria-label="Baixo Esquerda"><CornerDownLeft /></ToggleGroupItem>
                    <ToggleGroupItem value="bottom-right" aria-label="Baixo Direita"><CornerDownRight /></ToggleGroupItem>
                  </ToggleGroup>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        
        <DialogFooter className="p-4 bg-muted/50 border-t">
          <Button onClick={onRender} disabled={isProcessing} className="w-full bg-gradient-primary text-primary-foreground font-bold py-6 text-base hover:opacity-90 transition-opacity">
            {isProcessing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {isProcessing ? 'Criando...' : 'Criar vídeo'}
          </Button>
        </DialogFooter>
        <audio ref={audioRef} />
      </DialogContent>
    </Dialog>
  );
};