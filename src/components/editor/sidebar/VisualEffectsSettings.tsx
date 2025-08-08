import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Camera } from "lucide-react";

type ZoomEffect = "none" | "in" | "out" | "alternate";

interface VisualEffectsSettingsProps {
  zoomEffect: ZoomEffect;
  onZoomEffectChange: (effect: ZoomEffect) => void;
  zoomIntensity: number;
  onZoomIntensityChange: (intensity: number) => void;
  addFade: boolean;
  onAddFadeChange: (add: boolean) => void;
  fadeInDuration: number;
  onFadeInDurationChange: (duration: number) => void;
  fadeOutDuration: number;
  onFadeOutDurationChange: (duration: number) => void;
}

export const VisualEffectsSettings = ({
  zoomEffect,
  onZoomEffectChange,
  zoomIntensity,
  onZoomIntensityChange,
  addFade,
  onAddFadeChange,
  fadeInDuration,
  onFadeInDurationChange,
  fadeOutDuration,
  onFadeOutDurationChange,
}: VisualEffectsSettingsProps) => {
  return (
    <Card className="bg-background">
      <CardContent className="pt-6 space-y-4">
        <div>
          <Label className="text-sm font-medium flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Efeitos Visuais
          </Label>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs text-muted-foreground">Efeito de Zoom</Label>
              <Select value={zoomEffect} onValueChange={(value: ZoomEffect) => onZoomEffectChange(value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="alternate">Intercalar</SelectItem>
                  <SelectItem value="in">Zoom In</SelectItem>
                  <SelectItem value="out">Zoom Out</SelectItem>
                  <SelectItem value="none">Nenhum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {zoomEffect !== 'none' && (
              <div>
                <Label className="text-xs text-muted-foreground">Intensidade do Zoom ({zoomIntensity}%)</Label>
                <Slider value={[zoomIntensity]} onValueChange={(v) => onZoomIntensityChange(v[0])} max={50} min={10} step={5} />
              </div>
            )}
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="fade-switch" className="text-xs text-muted-foreground">Transições de Fade</Label>
                <Switch id="fade-switch" checked={addFade} onCheckedChange={onAddFadeChange} />
              </div>
              {addFade && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Duração Fade In ({fadeInDuration.toFixed(1)}s)</Label>
                    <Slider value={[fadeInDuration]} onValueChange={(v) => onFadeInDurationChange(v[0])} max={3} step={0.1} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Duração Fade Out ({fadeOutDuration.toFixed(1)}s)</Label>
                    <Slider value={[fadeOutDuration]} onValueChange={(v) => onFadeOutDurationChange(v[0])} max={3} step={0.1} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};