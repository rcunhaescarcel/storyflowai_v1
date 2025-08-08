import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Camera } from "lucide-react";

type ZoomEffect = "none" | "in" | "out" | "alternate";

interface VisualEffectsSettingsProps {
  zoomEffect: ZoomEffect;
  onZoomEffectChange: (effect: ZoomEffect) => void;
  zoomIntensity: number;
  onZoomIntensityChange: (intensity: number) => void;
}

export const VisualEffectsSettings = ({
  zoomEffect,
  onZoomEffectChange,
  zoomIntensity,
  onZoomIntensityChange,
}: VisualEffectsSettingsProps) => {
  return (
    <Card className="bg-background">
      <CardContent className="pt-6 space-y-6">
        <div>
          <Label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Efeito de Câmera (Zoom)
          </Label>
          <Select
            value={zoomEffect}
            onValueChange={(value: ZoomEffect) => onZoomEffectChange(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              <SelectItem value="in">Zoom In</SelectItem>
              <SelectItem value="out">Zoom Out</SelectItem>
              <SelectItem value="alternate">Alternado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {zoomEffect !== "none" && (
          <div>
            <Label className="text-xs text-muted-foreground">
              Intensidade do Zoom ({zoomIntensity}%)
            </Label>
            <Slider
              value={[zoomIntensity]}
              onValueChange={(value) => onZoomIntensityChange(value[0])}
              max={50}
              min={1}
              step={1}
              className="mt-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};