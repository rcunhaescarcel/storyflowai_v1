import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  CornerDownLeft,
  CornerDownRight,
  CornerUpLeft,
  CornerUpRight,
  Image as ImageIcon,
  Music,
  Trash2,
  Volume2,
} from "lucide-react";
import { LogoPosition } from "@/hooks/useFFmpeg";

interface AssetSettingsProps {
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
}

export const AssetSettings = ({
  backgroundMusic,
  backgroundMusicVolume,
  onBackgroundMusicUpload,
  onBackgroundMusicRemove,
  onBackgroundMusicVolumeChange,
  logoFile,
  logoPreview,
  logoPosition,
  onLogoUpload,
  onLogoRemove,
  onLogoPositionChange,
}: AssetSettingsProps) => {
  return (
    <Card className="bg-background">
      <CardContent className="pt-6 space-y-6">
        <div>
          <Label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Music className="w-4 h-4" />
            Trilha Sonora (Fundo)
          </Label>
          <Input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onBackgroundMusicUpload(file);
            }}
            className="hidden"
            id="bg-music-upload"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("bg-music-upload")?.click()}
            className="w-full"
          >
            Selecionar Música
          </Button>
          {backgroundMusic && (
            <div className="bg-muted/50 rounded-lg p-3 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-foreground truncate">
                  <Music className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{backgroundMusic.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBackgroundMusicRemove}
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-4">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  Volume ({Math.round(backgroundMusicVolume * 100)}%)
                </Label>
                <Slider
                  value={[backgroundMusicVolume]}
                  onValueChange={(value) => onBackgroundMusicVolumeChange(value[0])}
                  max={1}
                  min={0}
                  step={0.05}
                  className="mt-2"
                />
              </div>
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <Label className="text-sm font-medium mb-2 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Logotipo
          </Label>
          <Input
            type="file"
            accept="image/png, image/jpeg"
            onChange={onLogoUpload}
            className="hidden"
            id="logo-upload"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("logo-upload")?.click()}
            className="w-full"
          >
            Selecionar Logotipo
          </Button>
          {logoFile && (
            <div className="bg-muted/50 rounded-lg p-3 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-foreground truncate">
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="logo preview"
                      className="w-8 h-8 object-contain rounded"
                    />
                  )}
                  <span className="truncate">{logoFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogoRemove}
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-4">
                <Label className="text-xs text-muted-foreground">Posição do Logotipo</Label>
                <ToggleGroup
                  type="single"
                  value={logoPosition}
                  onValueChange={(value) => {
                    if (value) onLogoPositionChange(value as LogoPosition);
                  }}
                  className="grid grid-cols-4 gap-2 mt-2"
                >
                  <ToggleGroupItem value="top-left" aria-label="Topo Esquerdo">
                    <CornerUpLeft className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="top-right" aria-label="Topo Direito">
                    <CornerUpRight className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="bottom-left" aria-label="Inferior Esquerdo">
                    <CornerDownLeft className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="bottom-right" aria-label="Inferior Direito">
                    <CornerDownRight className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};