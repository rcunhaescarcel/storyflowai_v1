import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Video } from "lucide-react";

interface EditorHeaderProps {
  sceneCount: number;
  isProcessing: boolean;
  onRender: () => void;
}

export const EditorHeader = ({ sceneCount, isProcessing, onRender }: EditorHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-xl font-bold text-foreground">Editor de Vídeo</h1>
        </div>
        <div className="flex items-center gap-4">
          {sceneCount > 0 && (
            <Badge variant="secondary">
              {sceneCount} cena{sceneCount !== 1 ? "s" : ""}
            </Badge>
          )}
          <Button onClick={onRender} disabled={sceneCount === 0 || isProcessing}>
            {isProcessing ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Renderizando...
              </>
            ) : (
              <>
                <Video className="w-4 h-4 mr-2" />
                Renderizar Vídeo
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};