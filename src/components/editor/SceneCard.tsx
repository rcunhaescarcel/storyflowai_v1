import { ArrowDown, ArrowUp, Trash2, Sparkles, ImagePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scene } from "@/hooks/useFFmpeg";
import { NarrationGenerator } from "./NarrationGenerator";
import { Textarea } from "@/components/ui/textarea";

interface SceneCardProps {
  scene: Scene;
  index: number;
  totalScenes: number;
  onUpdate: (id: string, updates: Partial<Scene>) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onNarrationGenerated: (sceneId: string, file: File, dataUrl: string) => void;
  onEditImage: (scene: Scene) => void;
  addDebugLog: (message: string) => void;
}

export const SceneCard = ({
  scene,
  index,
  totalScenes,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onNarrationGenerated,
  onEditImage,
  addDebugLog,
}: SceneCardProps) => {
  return (
    <Card key={scene.id} className="bg-background">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-3">
            <Badge variant="outline" className="px-2.5 py-1 text-sm">
              {index + 1}
            </Badge>
            Cena
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMoveDown(index)}
              disabled={index === totalScenes - 1}
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(scene.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="Digite o texto que a IA deve narrar para esta cena..."
              value={scene.narrationText || ''}
              onChange={(e) => onUpdate(scene.id, { narrationText: e.target.value })}
              className="bg-transparent text-xs border border-input p-2 rounded-md resize-none h-auto focus-visible:ring-1 focus-visible:ring-ring"
              rows={3}
            />
            <NarrationGenerator
              narrationText={scene.narrationText}
              onAudioGenerated={(file, dataUrl) => onNarrationGenerated(scene.id, file, dataUrl)}
              addDebugLog={addDebugLog}
              audio={scene.audio}
              onAudioRemove={() => onUpdate(scene.id, { audio: undefined, duration: undefined, audioDataUrl: undefined })}
            />
          </div>
          <div className="w-1/3 max-w-[250px] flex-shrink-0">
            <div 
              className="relative aspect-video w-full bg-muted/50 rounded-lg overflow-hidden group border cursor-pointer"
              onClick={() => onEditImage(scene)}
            >
              {!scene.imagePreview ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-2 text-muted-foreground">
                  <ImagePlus className="w-10 h-10" />
                  <p className="text-sm font-medium text-center">Clique para gerar imagem</p>
                </div>
              ) : (
                <>
                  <img src={scene.imagePreview} alt="Preview da cena" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Editar Imagem
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};