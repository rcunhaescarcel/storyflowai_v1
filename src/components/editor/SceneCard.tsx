import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scene } from "@/hooks/useFFmpeg";
import { ImageUploader } from "./ImageUploader";
import { NarrationGenerator } from "./NarrationGenerator";

interface SceneCardProps {
  scene: Scene;
  index: number;
  totalScenes: number;
  characterImage?: File | null;
  characterImagePreview?: string | null;
  onUpdate: (id: string, updates: Partial<Scene>) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onImageUpload: (sceneId: string, file: File) => void;
  onNarrationGenerated: (sceneId: string, file: File) => void;
  onViewImage: (imageUrl: string | null) => void;
  addDebugLog: (message: string) => void;
}

export const SceneCard = ({
  scene,
  index,
  totalScenes,
  characterImage,
  characterImagePreview,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onImageUpload,
  onNarrationGenerated,
  onViewImage,
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
              onAudioGenerated={(file) => onNarrationGenerated(scene.id, file)}
              addDebugLog={addDebugLog}
              audio={scene.audio}
              duration={scene.duration}
              onAudioRemove={() => onUpdate(scene.id, { audio: undefined, duration: undefined })}
            />
          </div>
          <div className="md:col-span-2">
            <ImageUploader
              sceneId={scene.id}
              imagePreview={scene.imagePreview}
              onImageUpload={(file) => onImageUpload(scene.id, file)}
              onImageRemove={() => onUpdate(scene.id, { image: undefined, imagePreview: undefined })}
              onViewImage={() => onViewImage(scene.imagePreview || null)}
              characterImage={characterImage}
              characterImagePreview={characterImagePreview}
              addDebugLog={addDebugLog}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};