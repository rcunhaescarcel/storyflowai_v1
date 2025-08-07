import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scene } from '@/hooks/useFFmpeg';

interface EffectsPopoverProps {
  scene: Scene;
  onUpdate: (updates: Partial<Scene>) => void;
}

export const EffectsPopover = ({ scene, onUpdate }: EffectsPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Sparkles className="w-4 h-4 mr-2" />
          Efeitos Visuais
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Efeitos Visuais</h4>
            <p className="text-sm text-muted-foreground">
              Adicione movimento e transições à sua cena.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label htmlFor={`zoom-enabled-${scene.id}`} className="flex flex-col space-y-1">
                <span>Efeito Zoom</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Aplica um zoom suave.
                </span>
              </Label>
              <Switch
                id={`zoom-enabled-${scene.id}`}
                checked={scene.zoomEnabled}
                onCheckedChange={(checked) => onUpdate({ zoomEnabled: checked })}
              />
            </div>
            {scene.zoomEnabled && (
              <div className="grid gap-4 pl-4 border-l-2 ml-2">
                <div>
                  <Label className="text-xs">Intensidade ({scene.zoomIntensity}%)</Label>
                  <Slider
                    value={[scene.zoomIntensity]}
                    onValueChange={(value) => onUpdate({ zoomIntensity: value[0] })}
                    max={50}
                    min={10}
                    step={5}
                  />
                </div>
                <div>
                  <Label className="text-xs">Direção</Label>
                  <Select
                    value={scene.zoomDirection}
                    onValueChange={(value: 'in' | 'out') => onUpdate({ zoomDirection: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">Zoom In</SelectItem>
                      <SelectItem value="out">Zoom Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="rounded-lg border p-4 space-y-4">
              <Label>Transições Fade</Label>
              <div className="grid gap-2">
                <Label className="text-xs">Fade In ({scene.fadeInDuration}s)</Label>
                <Slider
                  value={[scene.fadeInDuration]}
                  onValueChange={(value) => onUpdate({ fadeInDuration: value[0] })}
                  max={3}
                  min={0}
                  step={0.1}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Fade Out ({scene.fadeOutDuration}s)</Label>
                <Slider
                  value={[scene.fadeOutDuration]}
                  onValueChange={(value) => onUpdate({ fadeOutDuration: value[0] })}
                  max={3}
                  min={0}
                  step={0.1}
                />
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};