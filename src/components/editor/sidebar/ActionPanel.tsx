import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Clock, Download, Video } from "lucide-react";

interface ActionPanelProps {
  isProcessing: boolean;
  onRender: () => void;
  sceneCount: number;
  progress: number;
  videoUrl: string | null;
  onDownloadVideo: () => void;
}

export const ActionPanel = ({
  isProcessing,
  onRender,
  sceneCount,
  progress,
  videoUrl,
  onDownloadVideo,
}: ActionPanelProps) => {
  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Video className="w-5 h-5" />
          Ações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {videoUrl && (
          <div className="space-y-3">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <video src={videoUrl} controls className="w-full h-full object-cover" />
            </div>
            <Button onClick={onDownloadVideo} className="w-full bg-green-600 hover:bg-green-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              Baixar Vídeo
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button onClick={onRender} disabled={sceneCount === 0 || isProcessing} className="w-full">
            <Video className="w-4 h-4 mr-2" />
            {isProcessing ? 'Renderizando...' : 'Renderizar Vídeo'}
          </Button>
        </div>
        
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
      </CardContent>
    </Card>
  );
};