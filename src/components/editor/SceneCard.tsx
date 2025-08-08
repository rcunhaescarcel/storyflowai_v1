import { ArrowDown, ArrowUp, Trash2, UserSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scene } from "@/hooks/useFFmpeg";
import { ImageUploader } from "./ImageUploader";
import { NarrationGenerator } from "./NarrationGenerator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  onSceneCharacterUpload: (sceneId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onSceneCharacterRemove: (sceneId: string) => void;
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
  onSceneCharacterUpload,
  onSceneCharacterRemove,
}: SceneCardProps) => {
  const characterInputId = `scene-character-upload-${scene.id}`;

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
            <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
              <Label htmlFor={characterInputId} className="text-sm font-medium flex items-center gap-2">
                <UserSquare className="w-4 h-4" />
                Personagem da Cena (Opcional)
              </Label>
              <span className="text-xs text-muted-foreground block">Use uma imagem de referência para gerar a imagem principal desta cena.</span>
              <Input
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => onSceneCharacterUpload(scene.id, e)}
                className="hidden"
                id={characterInputId}
              />
              {!scene.sceneCharacterImagePreview ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById(characterInputId)?.click()}
                  className="w-full mt-2"
                >
                  Selecionar Imagem do Personagem
                </Button>
              ) : (
                <div className="bg-muted/50 rounded-lg p-2 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-foreground truncate">
                      <img
                        src={scene.sceneCharacterImagePreview}
                        alt="character preview"
                        className="w-10 h-10 object-contain rounded"
                      />
                      <span className="truncate">{scene.sceneCharacterImage?.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onSceneCharacterRemove(scene.id)}
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <ImageUploader
              sceneId={scene.id}
              imagePreview={scene.imagePreview}
              onImageUpload={(file) => onImageUpload(scene.id, file)}
              onImageRemove={() => onUpdate(scene.id, { image: undefined, imagePreview: undefined })}
              onViewImage={() => onViewImage(scene.imagePreview || null)}
              characterImage={scene.sceneCharacterImage || characterImage}
              characterImagePreview={scene.sceneCharacterImagePreview || characterImagePreview}
              addDebugLog={addDebugLog}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};