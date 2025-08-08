import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Camera } from "lucide-react";

interface VisualEffectsSettingsProps {
  addVisualEffects: boolean;
  onAddVisualEffectsChange: (add: boolean) => void;
}

export const VisualEffectsSettings = ({
  addVisualEffects,
  onAddVisualEffectsChange,
}: VisualEffectsSettingsProps) => {
  return (
    <Card className="bg-background">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="effects-switch" className="text-sm font-medium flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Efeitos Visuais (Fade e Zoom)
          </Label>
          <Switch
            id="effects-switch"
            checked={addVisualEffects}
            onCheckedChange={onAddVisualEffectsChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};