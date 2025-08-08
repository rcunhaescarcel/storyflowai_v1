import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

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
}

export const RenderModal = (props: RenderModalProps) => {
  const {
    isOpen, onClose, onRender, isProcessing,
    backgroundMusic, backgroundMusicVolume, onBackgroundMusicUpload, onBackgroundMusicRemove, onBackgroundMusicVolumeChange,
    logoFile, logoPreview, logoPosition, onLogoUpload, onLogoRemove, onLogoPositionChange,
    subtitleStyle, onSubtitleStyleChange,
    addFade, onAddFadeChange,
    generateSubtitles, onGenerateSubtitlesChange
  } = props;

  const [subtitleColor, setSubtitleColor] = useState(subtitleStyle.fontColor || '#FFFFFF');

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubtitleColor(e.target.value);
    onSubtitleStyleChange({ fontColor: e.target.value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Clapperboard className="w-6 h-6" />
            Criar vídeo
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6 pb-6 space-y-4">
          {/* Trilha Musical */}
          <Card className="p-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 mb-4">
              <Music className="w-4 h-4 text-muted-foreground" />
              Trilha musical
            </CardTitle>
            <div className="grid grid-cols-2 gap-2">
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
              <Button variant="outline" onClick={() => document.getElementById("modal-bg-music-upload")?.click()}>
                <Music className="w-4 h-4 mr-2" />
                {backgroundMusic ? "Trocar" : "Trilha"}
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" disabled={!backgroundMusic}>
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
              <p className="text-xs text-muted-foreground mt-2 truncate">
                Selecionado: {backgroundMusic.name}
              </p>
            )}
          </Card>

          {/* Legenda */}
          <Card className="p-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Legenda
            </CardTitle>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch id="generate-subtitles" checked={generateSubtitles} onCheckedChange={onGenerateSubtitlesChange} />
                <Label htmlFor="generate-subtitles">Gerar legendas</Label>
              </div>
              <div className={cn("relative transition-opacity", !generateSubtitles && "opacity-50 cursor-not-allowed")}>
                <Input
                  type="color"
                  value={subtitleColor}
                  onChange={handleColorChange}
                  className="w-10 h-8 p-1 appearance-none bg-transparent border-none cursor-pointer"
                  style={{ backgroundColor: subtitleColor }}
                  disabled={!generateSubtitles}
                />
              </div>
            </div>
          </Card>

          {/* Efeitos */}
          <Card className="p-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              Efeitos
            </CardTitle>
            <div className="flex items-center gap-3">
              <Switch id="fade-transition" checked={addFade} onCheckedChange={onAddFadeChange} />
              <Label htmlFor="fade-transition">Transição Fade</Label>
            </div>
          </Card>

          {/* Logo */}
          <Card className="p-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2 mb-4">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
              Logo
            </CardTitle>
            <Input type="file" accept="image/*" onChange={onLogoUpload} className="hidden" id="modal-logo-upload" />
            <div
              className="relative w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/50"
              onClick={() => document.getElementById("modal-logo-upload")?.click()}
            >
              {logoPreview ? (
                <>
                  <img src={logoPreview} alt="Logo Preview" className="max-h-24 object-contain" />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-7"
                    onClick={(e) => { e.stopPropagation(); onLogoRemove(); }}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Excluir
                  </Button>
                </>
              ) : (
                <span className="text-muted-foreground">Clique para adicionar seu logo</span>
              )}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full mt-2" disabled={!logoFile}>
                  <Move className="w-4 h-4 mr-2" /> Posição
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-1">
                <ToggleGroup
                  type="single"
                  value={logoPosition}
                  onValueChange={(v) => { if (v) onLogoPositionChange(v as LogoPosition); }}
                >
                  <ToggleGroupItem value="top-left"><CornerUpLeft /></ToggleGroupItem>
                  <ToggleGroupItem value="top-right"><CornerUpRight /></ToggleGroupItem>
                  <ToggleGroupItem value="bottom-left"><CornerDownLeft /></ToggleGroupItem>
                  <ToggleGroupItem value="bottom-right"><CornerDownRight /></ToggleGroupItem>
                </ToggleGroup>
              </PopoverContent>
            </Popover>
          </Card>
        </div>
        
        <DialogFooter className="p-6 bg-muted/50 border-t">
          <Button onClick={onRender} disabled={isProcessing} className="w-full bg-green-500 hover:bg-green-600 text-white">
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