import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Music, Trash2, Volume2 } from "lucide-react";

interface MusicSettingsProps {
  backgroundMusic: File | null;
  backgroundMusicVolume: number;
  onBackgroundMusicUpload: (file: File) => void;
  onBackgroundMusicRemove: () => void;
  onBackgroundMusicVolumeChange: (volume: number) => void;
}

export const MusicSettings = ({
  backgroundMusic,
  backgroundMusicVolume,
  onBackgroundMusicUpload,
  onBackgroundMusicRemove,
  onBackgroundMusicVolumeChange,
}: MusicSettingsProps) => {
  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-3">
          <Music className="w-5 h-5" />
          Trilha Sonora (Fundo)
        </CardTitle>
      </CardHeader>
      <CardContent>
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
          onClick={() => document.getElementById("bg-music-upload")?.click()}
          className="w-full"
        >
          Selecionar Música
        </Button>
        {backgroundMusic && (
          <div className="bg-muted/50 rounded-lg p-3 mt-4">
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
      </CardContent>
    </Card>
  );
};