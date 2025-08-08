import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileVideo, Palette, Trash2 } from "lucide-react";
import { SubtitleStyle } from "@/hooks/useFFmpeg";

interface SubtitleSettingsProps {
  globalSrtFile: File | null;
  subtitleStyle: SubtitleStyle;
  onSrtUpload: (file: File) => void;
  onSrtRemove: () => void;
  onSubtitleStyleChange: (style: Partial<SubtitleStyle>) => void;
}

export const SubtitleSettings = ({
  globalSrtFile,
  subtitleStyle,
  onSrtUpload,
  onSrtRemove,
  onSubtitleStyleChange,
}: SubtitleSettingsProps) => {
  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-3">
          <FileVideo className="w-5 h-5" />
          Legenda Global (SRT)
        </CardTitle>
      </CardHeader>
      <CardContent>
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
          onClick={() => document.getElementById("srt-upload")?.click()}
          className="w-full"
        >
          Selecionar Arquivo SRT
        </Button>
        {globalSrtFile && (
          <div className="bg-muted/50 rounded-lg p-3 mt-4 flex items-center justify-between">
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

        {globalSrtFile && (
          <div className="border-t pt-4 mt-4 space-y-4">
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
  );
};