import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Film } from "lucide-react";

type VideoQuality = "hd" | "fullhd";

interface GeneralSettingsProps {
  videoQuality: VideoQuality;
  onVideoQualityChange: (quality: VideoQuality) => void;
}

export const GeneralSettings = ({
  videoQuality,
  onVideoQualityChange,
}: GeneralSettingsProps) => {
  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-3">
          <Film className="w-5 h-5" />
          Configurações Gerais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label>Qualidade do Vídeo</Label>
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
      </CardContent>
    </Card>
  );
};