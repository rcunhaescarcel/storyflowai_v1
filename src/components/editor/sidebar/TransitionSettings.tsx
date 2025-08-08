import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Film } from "lucide-react";

interface TransitionSettingsProps {
  addFade: boolean;
  onAddFadeChange: (add: boolean) => void;
}

export const TransitionSettings = ({
  addFade,
  onAddFadeChange,
}: TransitionSettingsProps) => {
  return (
    <Card className="bg-background">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="fade-switch" className="text-sm font-medium flex items-center gap-2">
            <Film className="w-4 h-4" />
            Transição Suave (Fade)
          </Label>
          <Switch
            id="fade-switch"
            checked={addFade}
            onCheckedChange={onAddFadeChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};