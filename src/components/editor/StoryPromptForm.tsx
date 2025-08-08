import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Loader2, ArrowUp, Wand2, Clock, Mic, Camera, Film } from 'lucide-react';
import { toast } from 'sonner';
import { Scene } from '@/hooks/useFFmpeg';
import { Progress } from '@/components/ui/progress';

const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio');
    const objectUrl = URL.createObjectURL(file);
    audio.src = objectUrl;
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
      URL.revokeObjectURL(objectUrl);
    };
    audio.onerror = (e) => {
      reject(`Error loading audio file: ${e}`);
      URL.revokeObjectURL(objectUrl);
    }
  });
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const openAIVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

interface StoryPromptFormProps {
  onStoryGenerated: (scenes: Scene[]) => void;
  addDebugLog: (message: string) => void;
  onAddSceneManually: () => void;
}

export const StoryPromptForm = ({ onStoryGenerated, addDebugLog, onAddSceneManually }: StoryPromptFormProps) => {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('30');
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [zoomEffect, setZoomEffect] = useState<'none' | 'in' | 'out' | 'alternate'>('alternate');
  const [addFade, setAddFade] = useState(true);
  const [fadeInDuration, setFadeInDuration] = useState(0.5);
  const [fadeOutDuration, setFadeOutDuration] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Gerando...');
  const [progress, setProgress] = useState(0);

  const handleGenerateStory = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor, insira um tema para a história.");
      return;
    }
    setIsLoading(true);
    setProgress(0);
    setLoadingMessage('Gerando roteiro da história...');
    addDebugLog(`[História IA] Iniciando geração para o prompt: "${prompt}" com duração de ${duration}s`);

    try {
      const numParagraphs = parseInt(duration) / 5;
      const storyPrompt = `Gere um roteiro para um vídeo de aproximadamente ${duration} segundos sobre o tema: "${prompt}". O roteiro deve ser dividido em cerca de ${numParagraphs} parágrafos. Para cada parágrafo (cena), forneça a narração em português e um prompt de imagem em inglês para gerar uma imagem no estilo de animação 3D. Use o formato: "Texto da narração. ||| English image prompt in 3D animation style." Não inclua títulos como "Cena 1".`;
      
      const encodedPrompt = encodeURIComponent(storyPrompt);
      const apiToken = "76b4jfL5SsXI48nS";
      const referrer = "https://vidflow.com.br/";
      const targetUrl = `https://text.pollinations.ai/${encodedPrompt}?token=${apiToken}&referrer=${referrer}`;

      addDebugLog(`[História IA] URL da API de texto: ${targetUrl.substring(0, 100)}...`);
      const response = await fetch(targetUrl);

      if (!response.ok) {
        const errorBody = await response.text();
        addDebugLog(`[História IA] ❌ ERRO na API de texto: ${errorBody}`);
        throw new Error(`A geração de texto falhou com o status: ${response.status}`);
      }

      const storyText = await response.text();
      addDebugLog(`[História IA] ✅ Texto recebido da IA.`);
      setProgress(5);

      const lines = storyText.trim().split('\n').filter(p => p.includes('|||'));
      
      if (lines.length === 0) {
        addDebugLog(`[História IA] ⚠️ A IA não retornou um roteiro no formato esperado.`);
        toast.warning("A IA não conseguiu gerar um roteiro válido. Tente um prompt diferente.");
        setIsLoading(false);
        return;
      }

      const scenesData = lines.map(line => {
        const parts = line.split('|||');
        return {
          narration: parts[0]?.trim() || '',
          imagePrompt: parts[1]?.trim() || ''
        };
      }).filter(data => data.narration && data.imagePrompt);

      const newScenes: Scene[] = [];
      const totalScenes = scenesData.length;
      const progressPerScene = 95 / totalScenes;

      for (let i = 0; i < totalScenes; i++) {
        const sceneData = scenesData[i];
        const baseProgress = 5 + (i * progressPerScene);

        setLoadingMessage(`Gerando imagem da cena ${i + 1}/${totalScenes}...`);
        addDebugLog(`[Imagem IA] Gerando para o prompt: "${sceneData.imagePrompt}"`);

        const encodedImagePrompt = encodeURIComponent(sceneData.imagePrompt);
        const imageModel = 'flux';
        const width = 1920;
        const height = 1080;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedImagePrompt}?width=${width}&height=${height}&model=${imageModel}&token=${apiToken}&referrer=${referrer}&nologo=true`;

        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) throw new Error(`Falha ao gerar imagem para a cena ${i + 1}`);
        const imageBlob = await imageResponse.blob();
        const imageFile = new File([imageBlob], `scene_${i + 1}.png`, { type: 'image/png' });
        const imagePreview = await blobToDataURL(imageBlob);
        
        setProgress(baseProgress + progressPerScene / 2);

        setLoadingMessage(`Gerando narração da cena ${i + 1}/${totalScenes}...`);
        addDebugLog(`[Áudio IA] Gerando para o texto: "${sceneData.narration.slice(0, 30)}..."`);

        const audioPrompt = `speak PT-BR: ${sceneData.narration}`;
        const encodedAudioPrompt = encodeURIComponent(audioPrompt);
        const audioUrl = `https://text.pollinations.ai/${encodedAudioPrompt}?model=openai-audio&voice=${selectedVoice}&referrer=${referrer}&token=${apiToken}`;

        const audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) throw new Error(`Falha ao gerar áudio para a cena ${i + 1}`);
        const audioBlob = await audioResponse.blob();
        const audioFile = new File([audioBlob], `narration_${i + 1}.mp3`, { type: 'audio/mpeg' });
        const audioDuration = await getAudioDuration(audioFile);

        let zoomEnabled = false;
        let zoomDirection: 'in' | 'out' = 'in';
        switch (zoomEffect) {
          case 'in': zoomEnabled = true; zoomDirection = 'in'; break;
          case 'out': zoomEnabled = true; zoomDirection = 'out'; break;
          case 'alternate': zoomEnabled = true; zoomDirection = i % 2 === 0 ? 'in' : 'out'; break;
          case 'none': default: zoomEnabled = false; break;
        }

        newScenes.push({
          id: crypto.randomUUID(),
          narrationText: sceneData.narration,
          image: imageFile,
          imagePreview: imagePreview,
          audio: audioFile,
          duration: audioDuration,
          effect: "fade",
          zoomEnabled,
          zoomIntensity: 20,
          zoomDirection,
          fadeInDuration: addFade ? fadeInDuration : 0,
          fadeOutDuration: addFade ? fadeOutDuration : 0,
        });
        
        setProgress(baseProgress + progressPerScene);
        await delay(500);
      }

      onStoryGenerated(newScenes);
      toast.success("História, imagens e narrações geradas com sucesso!");

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      addDebugLog(`[História IA] ❌ Falha na geração: ${errorMessage}`);
      toast.error(`Falha ao gerar a história: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <div className="w-full max-w-md text-center">
          <p className="text-lg font-medium text-foreground">{loadingMessage}</p>
          <Progress value={progress} className="w-full mt-4" />
          <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% concluído</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center h-full py-10">
      <Wand2 className="w-12 h-12 text-primary mb-4" />
      <h1 className="text-3xl font-bold text-center mb-2">Digite seu tema e deixe a mágica acontecer</h1>
      <p className="text-muted-foreground mb-8 text-center">A IA irá criar um roteiro, gerar imagens e narrações para montar seu vídeo.</p>
      
      <div className="w-full p-2 bg-background rounded-2xl shadow-lg border">
        <Textarea
          placeholder="Ex: A jornada de um pequeno robô que se perdeu na cidade e tenta encontrar o caminho de volta para casa..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="w-full border-none focus-visible:ring-0 text-base resize-none p-4 bg-transparent"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleGenerateStory();
            }
          }}
        />
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" /> Duração
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64"><div className="space-y-2"><Label>Duração (Aproximada)</Label><Select value={duration} onValueChange={setDuration}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="30">30s (~6 cenas)</SelectItem><SelectItem value="60">1m (~12 cenas)</SelectItem><SelectItem value="90">1m 30s (~18 cenas)</SelectItem></SelectContent></Select></div></PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Mic className="w-4 h-4 mr-2" /> Voz
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64"><div className="space-y-2"><Label>Voz da Narração</Label><Select value={selectedVoice} onValueChange={setSelectedVoice}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{openAIVoices.map(voice => (<SelectItem key={voice} value={voice} className="capitalize">{voice}</SelectItem>))}</SelectContent></Select></div></PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Camera className="w-4 h-4 mr-2" /> Efeitos
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80"><div className="space-y-4"><div><Label>Efeito de Zoom</Label><Select value={zoomEffect} onValueChange={(value: any) => setZoomEffect(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="alternate">Intercalar</SelectItem><SelectItem value="in">Zoom In</SelectItem><SelectItem value="out">Zoom Out</SelectItem><SelectItem value="none">Nenhum</SelectItem></SelectContent></Select></div><div><div className="flex items-center justify-between"><Label htmlFor="fade-switch-popover" className="flex items-center gap-2"><Film className="w-4 h-4" />Transições de Fade</Label><Switch id="fade-switch-popover" checked={addFade} onCheckedChange={setAddFade} /></div>{addFade && (<div className="mt-4 space-y-4 pl-4 border-l-2 ml-2"><div><Label className="text-xs text-muted-foreground">Fade In ({fadeInDuration.toFixed(1)}s)</Label><Slider value={[fadeInDuration]} onValueChange={(v) => setFadeInDuration(v[0])} max={3} step={0.1} /></div><div><Label className="text-xs text-muted-foreground">Fade Out ({fadeOutDuration.toFixed(1)}s)</Label><Slider value={[fadeOutDuration]} onValueChange={(v) => setFadeOutDuration(v[0])} max={3} step={0.1} /></div></div>)}</div></div></PopoverContent>
            </Popover>
          </div>
          <Button size="icon" className="rounded-full bg-primary hover:bg-primary/90" onClick={handleGenerateStory} disabled={!prompt.trim() || isLoading}>
            <ArrowUp className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <Button variant="link" className="mt-6 text-muted-foreground" onClick={onAddSceneManually}>
        Ou adicione a primeira cena manualmente
      </Button>
    </div>
  );
};