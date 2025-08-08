import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Loader2, ArrowUp, Wand2, Clock, Mic, Camera, Film, UserSquare, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Scene } from '@/hooks/useFFmpeg';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { resizeImage, dataURLtoFile } from '@/lib/imageUtils';
import { Input } from '@/components/ui/input';
import { SceneData } from '@/types/video';
import { useSession } from '@/contexts/SessionContext';

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
  onStoryGenerated: (scenes: Scene[], characterFile?: File, characterPreview?: string) => void;
  addDebugLog: (message: string) => void;
}

export const StoryPromptForm = ({ onStoryGenerated, addDebugLog }: StoryPromptFormProps) => {
  const { session } = useSession();
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
  const [characterImage, setCharacterImage] = useState<File | null>(null);
  const [characterImagePreview, setCharacterImagePreview] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleCharacterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resizedPreview = await resizeImage(file, 256, 256);
        const resizedFile = dataURLtoFile(resizedPreview, file.name);
        setCharacterImage(resizedFile);
        setCharacterImagePreview(resizedPreview);
        toast.success("Imagem do personagem carregada!");
      } catch (error) {
        toast.error("Falha ao processar a imagem do personagem.");
      }
    }
  };

  const handleGenerateStory = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor, insira um tema para a história.");
      return;
    }
    if (!session) {
      toast.error("Você precisa estar logado para criar uma história.");
      return;
    }
    setIsLoading(true);
    setProgress(0);
    setLoadingMessage('Gerando roteiro da história...');
    addDebugLog(`[História IA] Iniciando geração para o prompt: "${prompt}" com duração de ${duration}s`);

    try {
      const numParagraphs = parseInt(duration) / 5;
      let storyPrompt = `Crie um roteiro para um vídeo sobre "${prompt}". O vídeo deve ter ${numParagraphs} cenas. Para cada cena, escreva uma linha no formato exato: "NARRAÇÃO EM PORTUGUÊS. ||| IMAGE PROMPT IN ENGLISH FOR 3D ANIMATION STYLE.". Não adicione números de cena ou qualquer outro texto. Cada cena deve estar em uma nova linha.`;
      
      if (characterImage) {
        storyPrompt = `Crie um roteiro para um vídeo sobre "${prompt}" com um personagem principal. O vídeo deve ter ${numParagraphs} cenas. Para cada cena, escreva uma linha no formato exato: "NARRAÇÃO EM PORTUGUÊS. ||| o personagem [descrição da ação e cenário em inglês, estilo animação 3D].". Não adicione números de cena ou qualquer outro texto. Cada cena deve estar em uma nova linha.`;
      }

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
      addDebugLog(`[História IA] Raw story text: ${storyText}`);
      setProgress(5);

      let characterPublicUrl: string | null = null;
      if (characterImage) {
        setLoadingMessage('Preparando imagem do personagem...');
        const fileExt = characterImage.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('image-references').upload(fileName, characterImage);
        if (uploadError) throw new Error(`Falha no upload do personagem: ${uploadError.message}`);
        
        const { data: urlData } = supabase.storage.from('image-references').getPublicUrl(fileName);
        if (!urlData?.publicUrl) throw new Error('Não foi possível obter a URL pública do personagem.');
        
        characterPublicUrl = urlData.publicUrl;
        addDebugLog(`[História IA] ✅ Personagem carregado para: ${characterPublicUrl}`);

        try {
          addDebugLog(`[História IA] Verificando acessibilidade da URL pública...`);
          const verificationResponse = await fetch(characterPublicUrl);
          if (!verificationResponse.ok) {
            addDebugLog(`[História IA] ❌ ERRO: A URL pública do personagem não está acessível (Status: ${verificationResponse.status}). Verifique as políticas do bucket 'image-references' no Supabase para permitir leitura pública.`);
            throw new Error('A URL da imagem de referência não está publicamente acessível.');
          }
          addDebugLog(`[História IA] ✅ URL pública acessível.`);
        } catch (e) {
          addDebugLog(`[História IA] ❌ ERRO ao verificar a URL pública: ${e.message}`);
          throw new Error(`Falha ao verificar a URL da imagem de referência: ${e.message}`);
        }
      }

      const lines = storyText.trim().split('\n').filter(p => p.includes('|||'));
      if (lines.length === 0) {
        addDebugLog(`[História IA] ❌ ERRO: O roteiro recebido não está no formato esperado. Nenhuma linha contém '|||'.`);
        throw new Error("A IA não retornou um roteiro no formato esperado. Tente novamente ou ajuste o tema.");
      }

      const scenesData = lines.map(line => {
        const parts = line.split('|||');
        return { narration: parts[0]?.trim() || '', imagePrompt: parts[1]?.trim() || '' };
      }).filter(data => data.narration && data.imagePrompt);

      const newScenes: Scene[] = [];
      const totalScenes = scenesData.length;
      const progressPerScene = 85 / totalScenes;

      for (let i = 0; i < totalScenes; i++) {
        const sceneData = scenesData[i];
        const baseProgress = 5 + (i * progressPerScene);

        setLoadingMessage(`Gerando imagem da cena ${i + 1}/${totalScenes}...`);
        addDebugLog(`[Imagem IA] Gerando para o prompt: "${sceneData.imagePrompt}"`);

        const encodedImagePrompt = encodeURIComponent(sceneData.imagePrompt);
        let imageModel = 'flux';
        let imageUrl = `https://image.pollinations.ai/prompt/${encodedImagePrompt}?width=1920&height=1080&model=${imageModel}&token=${apiToken}&referrer=${referrer}&nologo=true`;

        if (characterPublicUrl) {
          imageModel = 'kontext';
          const encodedImageURL = encodeURIComponent(characterPublicUrl);
          imageUrl = `https://image.pollinations.ai/prompt/${encodedImagePrompt}?width=1920&height=1080&model=${imageModel}&image=${encodedImageURL}&token=${apiToken}&referrer=${referrer}&nologo=true`;
        }

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
        const audioFile = new File([audioBlob], `narration_${i + 1}.mp3`, { type: 'audio/mp3' });
        const audioDuration = await getAudioDuration(audioFile);

        let zoomEnabled = false;
        let zoomDirection: 'in' | 'out' = 'in';
        if (zoomEffect !== 'none') {
          zoomEnabled = true;
          zoomDirection = zoomEffect === 'alternate' ? (i % 2 === 0 ? 'in' : 'out') : zoomEffect;
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

      setLoadingMessage('Salvando projeto...');
      setProgress(90);
      addDebugLog('[DB] Iniciando salvamento do projeto...');

      const projectTitle = prompt.slice(0, 80) || 'Novo Projeto de Vídeo';
      const totalDuration = newScenes.reduce((acc, scene) => acc + (scene.duration || 0), 0);
      const sceneDataForDb: SceneData[] = [];
      const projectFolder = `projects/${session.user.id}/${crypto.randomUUID()}`;

      for (let i = 0; i < newScenes.length; i++) {
        const scene = newScenes[i];
        if (!scene.image || !scene.audio) throw new Error(`Arquivos da cena ${i + 1} não foram encontrados.`);

        const imagePath = `${projectFolder}/${scene.id}-image.png`;
        const { error: imageUploadError } = await supabase.storage.from('image-references').upload(imagePath, scene.image);
        if (imageUploadError) throw new Error(`Upload da imagem falhou: ${imageUploadError.message}`);
        const { data: { publicUrl: imageUrl } } = supabase.storage.from('image-references').getPublicUrl(imagePath);

        const audioPath = `${projectFolder}/${scene.id}-audio.mp3`;
        const { error: audioUploadError } = await supabase.storage.from('image-references').upload(audioPath, scene.audio);
        if (audioUploadError) throw new Error(`Upload do áudio falhou: ${audioUploadError.message}`);
        const { data: { publicUrl: audioUrl } } = supabase.storage.from('image-references').getPublicUrl(audioPath);

        sceneDataForDb.push({
          id: scene.id, image_url: imageUrl!, audio_url: audioUrl!, narration_text: scene.narrationText,
          duration: scene.duration, effect: scene.effect, zoomEnabled: scene.zoomEnabled,
          zoomIntensity: scene.zoomIntensity, zoomDirection: scene.zoomDirection,
          fadeInDuration: scene.fadeInDuration, fadeOutDuration: scene.fadeOutDuration,
        });
        setProgress(90 + (10 * (i + 1) / totalScenes));
      }

      const projectToInsert = {
        user_id: session.user.id,
        title: projectTitle,
        description: prompt,
        input_type: 'story_prompt',
        input_content: prompt,
        scenes: sceneDataForDb,
        video_duration: totalDuration,
        status: 'draft',
      };

      addDebugLog('[DB] Inserindo registro do projeto no banco de dados...');
      const { error: insertError } = await supabase.from('video_projects').insert(projectToInsert);
      if (insertError) {
        addDebugLog(`[DB] ❌ ERRO ao inserir no banco de dados: ${insertError.message}`);
        throw new Error(`Falha ao salvar o projeto: ${insertError.message}`);
      }

      addDebugLog('[DB] ✅ Projeto salvo com sucesso!');
      await queryClient.invalidateQueries({ queryKey: ['video_projects'] });

      onStoryGenerated(newScenes, characterImage, characterImagePreview);
      toast.success("História gerada e salva com sucesso!");

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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <UserSquare className="w-4 h-4 mr-2" /> Personagem
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <Label>Personagem de Referência</Label>
                  <Input id="character-upload-popover" type="file" accept="image/*" onChange={handleCharacterImageUpload} className="text-xs" />
                  {characterImagePreview && (
                    <div className="flex items-center gap-4 p-2 bg-muted/50 rounded-lg">
                      <img src={characterImagePreview} alt="Preview" className="w-12 h-12 rounded-md object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">{characterImage?.name}</p>
                        <p className="text-xs text-muted-foreground">Personagem carregado</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => { setCharacterImage(null); setCharacterImagePreview(null); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button size="icon" className="rounded-full bg-primary hover:bg-primary/90" onClick={handleGenerateStory} disabled={!prompt.trim() || isLoading}>
            <ArrowUp className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};