import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  CornerDownLeft,
  CornerDownRight,
  CornerUpLeft,
  CornerUpRight,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { LogoPosition } from "@/hooks/useFFmpeg";

interface LogoSettingsProps {
  logoFile: File | null;
  logoPreview: string | null;
  logoPosition: LogoPosition;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoRemove: () => void;
  onLogoPositionChange: (position: LogoPosition) => void;
}

export const LogoSettings = ({
  logoFile,
  logoPreview,
  logoPosition,
  onLogoUpload,
  onLogoRemove,
  onLogoPositionChange,
}: LogoSettingsProps) => {
  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-3">
          <ImageIcon className="w-5 h-5" />
          Logotipo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="file"
          accept="image/png, image/jpeg"
          onChange={onLogoUpload}
          className="hidden"
          id="logo-upload"
        />
        <Button
          variant="outline"
          onClick={() => document.getElementById("logo-upload")?.click()}
          className="w-full"
        >
          Selecionar Logotipo
        </Button>
        {logoFile && (
          <div className="bg-muted/50 rounded-lg p-3 mt-4">
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
      </CardContent>
    </Card>
  );
};