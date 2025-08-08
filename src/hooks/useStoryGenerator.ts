import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { Scene } from '@/hooks/useFFmpeg';
import { storyStyles, languages } from '@/lib/constants';
import { getAudioDuration, fetchWithRetry } from '@/lib/utils';
import { blobToDataURL } from '@/lib/imageUtils';
import { Profile } from '@/contexts/SessionContext';

interface UseStoryGeneratorProps {
  onStoryGenerated: (scenes: Scene[], title: string, characterFile?: File, characterPreview?: string, prompt?: string, style?: string) => void;
  addDebugLog: (message: string) => void;
}

interface GenerateStoryOptions {
  prompt: string;
  duration: string;
  selectedVoice: string;
  selectedStyle: string;
  characterImage: File | null;
  characterImagePreview: string | null;
}

export const useStoryGenerator = ({ onStoryGenerated, addDebugLog }: UseStoryGeneratorProps) => {
  const { session, profile, setProfile } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Gerando...');
  const [progress, setProgress] = useState(0);

  const generateStory = async (options: GenerateStoryOptions) => {
    const { prompt, duration, selectedVoice, selectedStyle, characterImage, characterImagePreview } = options;

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
      
      setProfile(updatedProfile as Profile);
      addDebugLog(`[Coins] 1 coin debitado. Saldo restante: ${updatedProfile.coins}`);

      const numParagraphs = parseInt(duration) / 5;
      const styleInfo = storyStyles[selectedStyle as keyof typeof storyStyles];
      const stylePrompt = styleInfo.promptSuffix;
      const languageKey = profile.default_language || 'pt-br';
      const languageName = languages[languageKey as keyof typeof languages];
      
      const storyPrompt = `Crie um roteiro para um vídeo sobre "${prompt}". O vídeo deve ter aproximadamente ${numParagraphs} cenas. A narração deve ser no idioma: ${languageName}. Retorne a resposta como um único objeto JSON válido com EXATAMENTE duas chaves: "title" e "scenes". A chave "scenes" deve ser um array de objetos, onde cada objeto representa uma cena e deve ter EXATAMENTE três chaves: "narration", "image_prompt" e "voice_tone". A chave "narration" deve conter APENAS o texto da narração em ${languageName}. A chave "image_prompt" deve conter APENAS o prompt para a imagem em inglês, terminando com "${stylePrompt}". A chave "voice_tone" deve conter o melhor tom de voz para a narração como uma frase curta no idioma ${languageName} (por exemplo, "Um tom calmo e inspirador."). Não inclua o prompt da imagem na narração. Exemplo: {"title": "As Aventuras do Robô Perdido", "scenes": [{"narration": "Era uma vez...", "image_prompt": "A magical castle${stylePrompt}", "voice_tone": "Um tom extravagante e gentil."}]}`;

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

      let storyData: { title: string; scenes: { narration: string; image_prompt: string; voice_tone: string; }[] };
      try {
        const jsonStart = storyText.indexOf('{');
        const jsonEnd = storyText.lastIndexOf('}');
        if (jsonStart === -1 || jsonEnd === -1) {
          throw new Error("Nenhum objeto JSON encontrado na resposta da IA.");
        }
        const jsonString = storyText.substring(jsonStart, jsonEnd + 1);
        storyData = JSON.parse(jsonString);
      } catch (e) {
        addDebugLog(`[História IA] ❌ ERRO: Falha ao parsear o JSON do roteiro. Resposta recebida: ${storyText}`);
        throw new Error("A IA retornou um formato de roteiro inválido. Por favor, tente novamente.");
      }

      const scenesData = storyData.scenes;
      const storyTitle = storyData.title;

      if (!storyTitle || !Array.isArray(scenesData) || scenesData.length === 0) {
        throw new Error("A IA não retornou um título ou roteiro com cenas válidas.");
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
          const errorMessage = e instanceof Error ? e.message : String(e);
          addDebugLog(`[História IA] ❌ ERRO ao verificar a URL pública: ${errorMessage}`);
          throw new Error(`Falha ao verificar a URL da imagem de referência: ${errorMessage}`);
        }
      }
      setProgress(15);

      const totalScenes = scenesData.length;
      
      // --- Stage 1: Generate all images ---
      const imageGenerationProgress = 40;
      const progressPerImage = imageGenerationProgress / totalScenes;
      const imageResults: { imageFile: File, imagePreview: string }[] = [];

      for (let i = 0; i < totalScenes; i++) {
        const sceneData = scenesData[i];
        const baseProgress = 15 + (i * progressPerImage);
        setLoadingMessage(`Gerando imagem ${i + 1}/${totalScenes}...`);
        
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

        imageResults.push({ imageFile, imagePreview });
        setProgress(Math.round(baseProgress + progressPerImage));
      }
      addDebugLog(`[História IA] ✅ Todas as ${totalScenes} imagens foram geradas.`);

      // --- Stage 2: Generate all audios ---
      const audioGenerationProgress = 40;
      const progressPerAudio = audioGenerationProgress / totalScenes;
      const audioResults: { audioFile: File, audioDataUrl: string, audioDuration: number }[] = [];

      for (let i = 0; i < totalScenes; i++) {
        const sceneData = scenesData[i];
        const baseProgress = 15 + imageGenerationProgress + (i * progressPerAudio);
        setLoadingMessage(`Gerando narração ${i + 1}/${totalScenes}...`);
        
        addDebugLog(`[Áudio IA] Gerando para o texto: "${sceneData.narration.slice(0, 30)}..." com o tom: "${sceneData.voice_tone}"`);

        const { data: audioBlob, error: audioError } = await supabase.functions.invoke('generate-emotional-voice', {
          body: {
            text: sceneData.narration,
            voice: selectedVoice,
            tone: sceneData.voice_tone,
            language: languageKey,
          },
        });

        if (audioError) throw new Error(`Falha ao gerar áudio para a cena ${i + 1}: ${audioError.message}`);

        const audioFile = new File([audioBlob], `narration_${i + 1}.mp3`, { type: 'audio/mp3' });
        const audioDuration = await getAudioDuration(audioFile);
        const audioDataUrl = await blobToDataURL(audioBlob);

        audioResults.push({ audioFile, audioDataUrl, audioDuration });
        setProgress(Math.round(baseProgress + progressPerAudio));
      }
      addDebugLog(`[História IA] ✅ Todas as ${totalScenes} narrações foram geradas.`);

      // --- Stage 3: Combine and finalize ---
      setLoadingMessage('Finalizando...');
      setProgress(95);

      const newScenes: Scene[] = [];
      for (let i = 0; i < totalScenes; i++) {
        const sceneData = scenesData[i];
        const imageResult = imageResults[i];
        const audioResult = audioResults[i];

        newScenes.push({
          id: crypto.randomUUID(),
          narrationText: sceneData.narration,
          image: imageResult.imageFile,
          imagePreview: imageResult.imagePreview,
          imagePrompt: sceneData.image_prompt,
          audio: audioResult.audioFile,
          audioDataUrl: audioResult.audioDataUrl,
          duration: audioResult.audioDuration,
        });
      }

      setProgress(100);
      onStoryGenerated(newScenes, storyTitle, characterImage, characterImagePreview, prompt, styleInfo.label);

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

  return { generateStory, isLoading, loadingMessage, progress };
};