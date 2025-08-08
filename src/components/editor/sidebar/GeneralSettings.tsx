import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Film, Globe } from "lucide-react";

type VideoQuality = "hd" | "fullhd";

interface GeneralSettingsProps {
  isEditing: boolean;
  projectTitle: string;
  onProjectTitleChange: (title: string) => void;
  videoQuality: VideoQuality;
  onVideoQualityChange: (quality: VideoQuality) => void;
}

export const GeneralSettings = ({
  isEditing,
  projectTitle,
  onProjectTitleChange,
  videoQuality,
  onVideoQualityChange,
}: GeneralSettingsProps) => {
  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Configurações Gerais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing && (
          <div>
            <Label className="text-sm font-medium mb-2 flex items-center gap-2">
              Título do Projeto
            </Label>
            <Input
              value={projectTitle}
              onChange={(e) => onProjectTitleChange(e.target.value)}
              placeholder="Dê um nome ao seu vídeo"
            />
          </div>
        )}
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
      </CardContent>
    </Card>
  );
};