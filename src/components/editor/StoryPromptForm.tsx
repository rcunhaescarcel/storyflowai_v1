import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Clock, Mic, UserSquare, Trash2, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { Scene } from '@/hooks/useFFmpeg';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { resizeImage, dataURLtoFile, blobToDataURL } from '@/lib/imageUtils';
import { useSession } from '@/contexts/SessionContext';
import { storyStyles, openAIVoices, languages } from '@/lib/constants';
import { CharacterModal } from './CharacterModal';

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

const fetchWithRetry = async (url: string, { retries = 3, delayMs = 2000, addDebugLog, apiName = 'API' }: { retries?: number, delayMs?: number, addDebugLog: (msg: string) => void, apiName?: string }): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
      const errorText = await response.text();
      addDebugLog(`[${apiName} Tentativa ${i + 1}/${retries}] Falha com status ${response.status}.`);
      
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new Error(`Erro da API (${response.status}): ${errorText}`);
      }
      addDebugLog(`[${apiName}] Aguardando ${delayMs * (i + 1)}ms para tentar novamente...`);
      await delay(delayMs * (i + 1));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addDebugLog(`[${apiName} Tentativa ${i + 1}/${retries}] Falha na requisição: ${errorMessage}`);
      if (i === retries - 1) {
        addDebugLog(`[${apiName}] Todas as ${retries} tentativas falharam.`);
        throw error;
      }
      addDebugLog(`[${apiName}] Aguardando ${delayMs * (i + 1)}ms para tentar novamente...`);
      await delay(delayMs * (i + 1));
    }
  }
  throw new Error('Todas as tentativas de requisição falharam.');
};

interface StoryPromptFormProps {
  onStoryGenerated: (scenes: Scene[], characterFile?: File, characterPreview?: string, prompt?: string, style?: string) => void;
  addDebugLog: (message: string) => void;
}

export const StoryPromptForm = ({ onStoryGenerated, addDebugLog }: StoryPromptFormProps) => {
  const { session, profile, setProfile, isLoading: isSessionLoading } = useSession();
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('30');
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [selectedStyle, setSelectedStyle] = useState('pixar');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Gerando...');
  const [progress, setProgress] = useState(0);
  const [characterImage, setCharacterImage] = useState<File | null>(null);
  const [characterImagePreview, setCharacterImagePreview] = useState<string | null>(null);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setDuration(String(profile.default_duration || '30'));
      setSelectedVoice(profile.default_voice || 'nova');
      setSelectedStyle(profile.default_style || 'pixar');
    }
  }, [profile]);

  const handleCharacterConfirm = (file: File, preview: string) => {
    setCharacterImage(file);
    setCharacterImagePreview(preview);
    toast.success("Personagem selecionado com sucesso!");
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
    if (!profile || (profile.coins ?? 0) < 1) {
      toast.error("Créditos insuficientes", { description: "Você não tem coins suficientes para gerar uma história. Recarregue para continuar." });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setLoadingMessage('Gerando roteiro da história...');
    addDebugLog(`[História IA] Iniciando geração para o prompt: "${prompt}" com duração de ${duration}s`);

    const initialCoins = profile.coins ?? 0;

    try {
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ coins: initialCoins - 1 })
        .eq('id', session.user.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Falha ao debitar os créditos: ${updateError.message}`);
      }
      
      setProfile(updatedProfile);
      addDebugLog(`[Coins] 1 coin debitado. Saldo restante: ${updatedProfile.coins}`);

      const numParagraphs = parseInt(duration) / 5;
      const styleInfo = storyStyles[selectedStyle as keyof typeof storyStyles];
      const stylePrompt = styleInfo.promptSuffix;
      const languageKey = profile.default_language || 'pt-br';
      const languageName = languages[languageKey as keyof typeof languages];
      
      const storyPrompt = `Crie um roteiro para um vídeo sobre "${prompt}". O vídeo deve ter aproximadamente ${numParagraphs} cenas. A narração deve ser no idioma: ${languageName}. Retorne a resposta como um array JSON válido. Cada objeto no array representa uma cena e deve ter EXATAMENTE duas chaves: "narration" e "image_prompt". A chave "narration" deve conter APENAS o texto da narração em ${languageName}. A chave "image_prompt" deve conter APENAS o prompt para a imagem em inglês, terminando com "${stylePrompt}". Não inclua o prompt da imagem na narração. Exemplo: [{"narration": "Era uma vez...", "image_prompt": "A magical castle${stylePrompt}"}]`;

      const encodedPrompt = encodeURIComponent(storyPrompt);
      const apiToken = "76b4jfL5SsXI48nS";
      const referrer = "https://storyflow.app/";
      const targetUrl = `https://text.pollinations.ai/${encodedPrompt}?token=${apiToken}&referrer=${referrer}`;

      addDebugLog(`[História IA] URL da API de texto: ${targetUrl.substring(0, 100)}...`);
      const response = await fetchWithRetry(targetUrl, { addDebugLog, apiName: 'História IA' });

      if (!response.ok) {
        const errorBody = await response.text();
        addDebugLog(`[História IA] ❌ ERRO na API de texto: ${errorBody}`);
        throw new Error(`A geração de texto falhou com o status: ${response.status}`);
      }

      const storyText = await response.text();
      addDebugLog(`[História IA] ✅ Texto recebido da IA.`);
      setProgress(10);

      let scenesData: { narration: string; image_prompt: string; }[];
      try {
        const jsonStart = storyText.indexOf('[');
        const jsonEnd = storyText.lastIndexOf(']');
        if (jsonStart === -1 || jsonEnd === -1) {
          throw new Error("Nenhum array JSON encontrado na resposta da IA.");
        }
        const jsonString = storyText.substring(jsonStart, jsonEnd + 1);
        scenesData = JSON.parse(jsonString);
      } catch (e) {
        addDebugLog(`[História IA] ❌ ERRO: Falha ao parsear o JSON do roteiro. Resposta recebida: ${storyText}`);
        throw new Error("A IA retornou um formato de roteiro inválido. Por favor, tente novamente.");
      }

      if (!Array.isArray(scenesData) || scenesData.length === 0) {
        throw new Error("A IA não retornou um roteiro com cenas válidas.");
      }

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
      setProgress(15);

      const newScenes: Scene[] = [];
      const totalScenes = scenesData.length;
      const progressPerScene = 85 / totalScenes;

      for (let i = 0; i < totalScenes; i++) {
        const sceneData = scenesData[i];
        const baseProgress = 15 + (i * progressPerScene);

        setLoadingMessage(`Gerando imagem da cena ${i + 1}/${totalScenes}...`);
        
        const imagePromptForApi = sceneData.image_prompt;
        addDebugLog(`[Imagem IA] Gerando para o prompt: "${imagePromptForApi}"`);

        const encodedImagePrompt = encodeURIComponent(imagePromptForApi);
        let imageModel = 'flux';
        let imageUrl = `https://image.pollinations.ai/prompt/${encodedImagePrompt}?width=1920&height=1080&model=${imageModel}&token=${apiToken}&referrer=${referrer}&nologo=true`;

        if (characterPublicUrl) {
          imageModel = 'kontext';
          const encodedImageURL = encodeURIComponent(characterPublicUrl);
          imageUrl = `https://image.pollinations.ai/prompt/${encodedImagePrompt}?width=1920&height=1080&model=${imageModel}&image=${encodedImageURL}&token=${apiToken}&referrer=${referrer}&nologo=true`;
        }

        const imageResponse = await fetchWithRetry(imageUrl, { addDebugLog, apiName: 'Imagem IA' });
        if (!imageResponse.ok) throw new Error(`Falha ao gerar imagem para a cena ${i + 1}`);
        const imageBlob = await imageResponse.blob();
        const imageFile = new File([imageBlob], `scene_${i + 1}.png`, { type: 'image/png' });
        const imagePreview = await blobToDataURL(imageBlob);
        
        setProgress(baseProgress + progressPerScene / 2);

        setLoadingMessage(`Gerando narração da cena ${i + 1}/${totalScenes}...`);
        addDebugLog(`[Áudio IA] Gerando para o texto: "${sceneData.narration.slice(0, 30)}..."`);

        const audioPrompt = `speak ${languageKey.toUpperCase()}: ${sceneData.narration}`;
        const encodedAudioPrompt = encodeURIComponent(audioPrompt);
        const audioUrl = `https://text.pollinations.ai/${encodedAudioPrompt}?model=openai-audio&voice=${selectedVoice}&referrer=${referrer}&token=${apiToken}`;

        const audioResponse = await fetchWithRetry(audioUrl, { addDebugLog, apiName: 'Áudio IA' });
        if (!audioResponse.ok) throw new Error(`Falha ao gerar áudio para a cena ${i + 1}`);
        const audioBlob = await audioResponse.blob();
        const audioFile = new File([audioBlob], `narration_${i + 1}.mp3`, { type: 'audio/mp3' });
        const audioDuration = await getAudioDuration(audioFile);
        const audioDataUrl = await blobToDataURL(audioBlob);

        newScenes.push({
          id: crypto.randomUUID(),
          narrationText: sceneData.narration,
          image: imageFile,
          imagePreview: imagePreview,
          imagePrompt: sceneData.image_prompt,
          audio: audioFile,
          audioDataUrl: audioDataUrl,
          duration: audioDuration,
        });
        
        setProgress(baseProgress + progressPerScene);
      }

      onStoryGenerated(newScenes, characterImage, characterImagePreview, prompt, styleInfo.label);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      addDebugLog(`[História IA] ❌ Falha na geração: ${errorMessage}`);
      toast.error(`Falha ao gerar a história: ${errorMessage}`);
      
      addDebugLog(`[Coins] Erro na geração. Reembolsando 1 coin...`);
      const { error: refundError } = await supabase
        .from('profiles')
        .update({ coins: initialCoins })
        .eq('id', session!.user.id);

      if (refundError) {
        addDebugLog(`[Coins] ❌ FALHA CRÍTICA: Não foi possível reembolsar o coin. Erro: ${refundError.message}`);
        toast.error("Falha Crítica", { description: "Ocorreu um erro e não foi possível devolver seu crédito. Por favor, contate o suporte." });
      } else {
        setProfile(prev => prev ? { ...prev, coins: initialCoins } : null);
        addDebugLog(`[Coins] ✅ Coin reembolsado com sucesso.`);
        toast.info("Seu crédito foi devolvido", { description: "Como a geração falhou, o coin utilizado foi estornado para sua conta." });
      }

    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  if (isLoading || isSessionLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <div className="w-full max-w-md text-center">
          <p className="text-lg font-medium text-foreground">{isLoading ? loadingMessage : 'Carregando sessão...'}</p>
          {isLoading && <Progress value={progress} className="w-full mt-4" />}
          {isLoading && <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% concluído</p>}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center h-full py-10">
        <Sparkles className="w-12 h-12 mb-4" stroke="url(#icon-gradient)" />
        <h1 className="text-3xl font-bold text-center mb-2">
          <span className="bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text">
            Digite seu tema
          </span>
          <span className="text-foreground"> e deixe a mágica acontecer</span>
        </h1>
        <p className="text-muted-foreground mb-8 text-center">A IA irá criar um roteiro, gerar imagens e narrações para montar seu vídeo.</p>
        
        <div className="w-full p-2 bg-background rounded-2xl shadow-lg border">
          <div className="flex items-start gap-4 p-2">
            {characterImagePreview && (
              <div className="relative w-20 h-28 flex-shrink-0 group bg-muted/50 rounded-lg">
                <img src={characterImagePreview} alt="Personagem" className="w-full h-full rounded-lg object-contain" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setCharacterImage(null);
                    setCharacterImagePreview(null);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
            <Textarea
              placeholder="Ex: A jornada de um pequeno robô que se perdeu na cidade e tenta encontrar o caminho de volta para casa..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full border-none focus-visible:ring-0 text-base resize-none p-2 bg-transparent self-center"
              disabled={isLoading || isSessionLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!isSessionLoading) handleGenerateStory();
                }
              }}
            />
          </div>

          <div className="flex items-center justify-between p-2 mt-2 border-t">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedVoice} onValueChange={setSelectedVoice} disabled={isLoading || isSessionLoading}>
                <SelectTrigger className="w-auto h-9 px-3 border-none bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0 gap-2">
                  <Mic className="w-4 h-4 flex-shrink-0" />
                  <SelectValue placeholder="Voz" />
                </SelectTrigger>
                <SelectContent>
                  {openAIVoices.map(voice => (
                    <SelectItem key={voice} value={voice} className="capitalize">{voice}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStyle} onValueChange={setSelectedStyle} disabled={isLoading || isSessionLoading}>
                <SelectTrigger className="w-auto h-9 px-3 border-none bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0 gap-2">
                  <Palette className="w-4 h-4 flex-shrink-0" />
                  <SelectValue placeholder="Estilo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(storyStyles).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={duration} onValueChange={setDuration} disabled={isLoading || isSessionLoading}>
                <SelectTrigger className="w-auto h-9 px-3 border-none bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0 gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <SelectValue placeholder="Duração" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30s</SelectItem>
                  <SelectItem value="60">1m</SelectItem>
                  <SelectItem value="90">1m 30s</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="ghost" size="sm" className="h-9 px-3 text-muted-foreground" onClick={() => setIsCharacterModalOpen(true)} disabled={isLoading || isSessionLoading}>
                <UserSquare className="w-4 h-4 mr-2" /> Personagem
              </Button>
            </div>
            <Button onClick={handleGenerateStory} disabled={!prompt.trim() || isLoading || isSessionLoading}>
              <Sparkles className="w-4 h-4 mr-2" />
              Criar História
            </Button>
          </div>
        </div>
      </div>
      <CharacterModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        onConfirm={handleCharacterConfirm}
      />
    </>
  );
};