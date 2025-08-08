import { ArrowDown, ArrowUp, Trash2, Wand2, ImagePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scene } from "@/hooks/useFFmpeg";
import { NarrationGenerator } from "./NarrationGenerator";

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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-4">
            <NarrationGenerator
              narrationText={scene.narrationText}
              onTextChange={(text) => onUpdate(scene.id, { narrationText: text })}
              onAudioGenerated={(file, dataUrl) => onNarrationGenerated(scene.id, file, dataUrl)}
              addDebugLog={addDebugLog}
              audio={scene.audio}
              duration={scene.duration}
              onAudioRemove={() => onUpdate(scene.id, { audio: undefined, duration: undefined, audioDataUrl: undefined })}
            />
          </div>
          <div className="md:col-span-2">
            <div className="relative aspect-video w-full bg-muted/50 rounded-lg overflow-hidden group border">
              {!scene.imagePreview ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-3">
                  <ImagePlus className="w-10 h-10 text-muted-foreground" />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => onEditImage(scene)}
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Gerar com IA
                  </Button>
                </div>
              ) : (
                <>
                  <img src={scene.imagePreview} alt="Preview da cena" className="w-full h-full object-cover" crossOrigin="anonymous" />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                    onClick={() => onEditImage(scene)}
                  >
                    <Wand2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};