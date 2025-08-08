import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Clock,
  Copy,
  CornerDownLeft,
  CornerDownRight,
  CornerUpLeft,
  CornerUpRight,
  Download,
  FileVideo,
  Film,
  Globe,
  Image as ImageIcon,
  Music,
  Palette,
  Trash2,
  UserSquare,
  Video,
  Volume2,
} from "lucide-react";
import { LogoPosition, SubtitleStyle } from "@/hooks/useFFmpeg";

type VideoQuality = "hd" | "fullhd";

interface EditorSidebarProps {
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
  progress: number;
  videoUrl: string | null;
  debugLogs: string[];
  onDownloadVideo: () => void;
  onCopyLogs: () => void;
  onClearLogs: () => void;
  onRender: () => void;
  sceneCount: number;
}

export const EditorSidebar = ({
  videoQuality,
  onVideoQualityChange,
  characterImage,
  characterImagePreview,
  onCharacterImageUpload,
  onCharacterImageRemove,
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
  globalSrtFile,
  subtitleStyle,
  onSrtUpload,
  onSrtRemove,
  onSubtitleStyleChange,
  isProcessing,
  progress,
  videoUrl,
  debugLogs,
  onDownloadVideo,
  onCopyLogs,
  onClearLogs,
  onRender,
  sceneCount,
}: EditorSidebarProps) => {
  return (
    <aside className="lg:col-span-4 space-y-8">
      <div className="sticky top-24 space-y-8">
        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Film className="w-4 h-4" />
                Qualidade do Vídeo
              </Label>
              <Select
                value={videoQuality}
                onValueChange={(value: VideoQuality) => onVideoQualityChange(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fullhd">Full HD (1080p)</SelectItem>
                  <SelectItem value="hd">HD (720p)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-6">
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                <UserSquare className="w-4 h-4" />
                Personagem (Contexto)
              </Label>
              <Input
                type="file"
                accept="image/png, image/jpeg"
                onChange={onCharacterImageUpload}
                className="hidden"
                id="character-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("character-upload")?.click()}
                className="w-full"
              >
                Selecionar Imagem
              </Button>
              {characterImage && (
                <div className="bg-muted/50 rounded-lg p-3 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-foreground truncate">
                      {characterImagePreview && (
                        <img
                          src={characterImagePreview}
                          alt="character preview"
                          className="w-10 h-10 object-contain rounded"
                        />
                      )}
                      <span className="truncate">{characterImage.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onCharacterImageRemove}
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
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

            <div className="border-t pt-6">
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileVideo className="w-4 h-4" />
                Legenda Global (SRT)
              </Label>
              <Input
                type="file"
                accept=".srt,text/plain"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onSrtUpload(file);
                }}
                className="hidden"
                id="srt-upload"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("srt-upload")?.click()}
                className="w-full"
              >
                Selecionar Arquivo SRT
              </Button>
              {globalSrtFile && (
                <div className="bg-muted/50 rounded-lg p-3 mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-foreground truncate">
                    <FileVideo className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{globalSrtFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onSrtRemove}
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {globalSrtFile && (
              <div className="border-t pt-6 space-y-4">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Estilo da Legenda
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">Fonte</Label>
                    <Select
                      value={subtitleStyle.fontFamily}
                      onValueChange={(value) => onSubtitleStyleChange({ fontFamily: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Helvetica">Helvetica</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        <SelectItem value="Courier New">Courier New</SelectItem>
                        <SelectItem value="Verdana">Verdana</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                        <SelectItem value="Impact">Impact</SelectItem>
                        <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">Tamanho</Label>
                    <Input
                      type="number"
                      min="12"
                      max="72"
                      value={subtitleStyle.fontSize}
                      onChange={(e) => onSubtitleStyleChange({ fontSize: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">Cor</Label>
                    <Input
                      type="color"
                      value={subtitleStyle.fontColor}
                      onChange={(e) => onSubtitleStyleChange({ fontColor: e.target.value })}
                      className="p-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">Sombra</Label>
                    <Input
                      type="color"
                      value={subtitleStyle.shadowColor}
                      onChange={(e) => onSubtitleStyleChange({ shadowColor: e.target.value })}
                      className="p-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-background">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Video className="w-5 h-5" />
              Renderização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isProcessing && !videoUrl && (
              <Button onClick={onRender} disabled={sceneCount === 0} className="w-full">
                <Video className="w-4 h-4 mr-2" />
                Renderizar Vídeo
              </Button>
            )}
            {isProcessing && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="text-foreground font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 animate-spin" />
                  Processando...
                </div>
              </div>
            )}
            {videoUrl && (
              <div className="space-y-3">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <video src={videoUrl} controls className="w-full h-full object-cover" />
                </div>
                <Button onClick={onDownloadVideo} className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Vídeo
                </Button>
                {!isProcessing && (
                  <Button onClick={onRender} variant="outline" className="w-full">
                    <Video className="w-4 h-4 mr-2" />
                    Renderizar Novamente
                  </Button>
                )}
              </div>
            )}
            {debugLogs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Logs de Debug</Label>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={onCopyLogs}>
                      <Copy className="w-3 h-3 mr-1.5" />
                      Copiar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClearLogs}>
                      Limpar
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-40 w-full rounded-md border bg-muted/50 p-3">
                  <div className="space-y-1">
                    {debugLogs.map((log, index) => (
                      <div key={index} className="text-xs font-mono text-muted-foreground">
                        {log}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </aside>
  );
};