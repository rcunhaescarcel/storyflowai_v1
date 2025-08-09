import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { VideoFormat } from '@/hooks/useFFmpeg';
import { fetchWithRetry } from './utils';

interface GenerateImageOptions {
  prompt: string;
  characterImage: File | null;
  videoFormat: VideoFormat;
  useCharacter: boolean;
  addDebugLog: (message: string) => void;
}

export const generateImage = async ({
  prompt,
  characterImage,
  videoFormat,
  useCharacter,
  addDebugLog,
}: GenerateImageOptions): Promise<{ file: File; prompt: string } | null> => {
  if (!prompt.trim()) {
    toast.error("Por favor, insira uma descrição para a imagem.");
    return null;
  }

  let targetUrl = '';
  const apiToken = "76b4jfL5SsXI48nS";
  const referrer = "https://storyflow.app/";
  const isPortrait = videoFormat === 'portrait';
  const width = isPortrait ? 1080 : 1920;
  const height = isPortrait ? 1920 : 1080;

  try {
    const finalPrompt = (characterImage && useCharacter) ? `o personagem ${prompt}` : prompt;
    const encodedPrompt = encodeURIComponent(finalPrompt);

    if (characterImage && useCharacter) {
      addDebugLog('[IA] Fazendo upload da imagem de referência para o Supabase Storage...');
      const fileExt = characterImage.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('image-references').upload(fileName, characterImage, { upsert: true });
      if (uploadError) throw new Error(`Falha ao fazer upload da imagem de referência: ${uploadError.message}`);
      
      const { data: urlData } = supabase.storage.from('image-references').getPublicUrl(fileName);
      if (!urlData?.publicUrl) throw new Error('Não foi possível obter a URL pública da imagem.');
      
      const publicUrl = urlData.publicUrl;
      addDebugLog(`[IA] URL pública obtida: ${publicUrl}`);

      const model = 'kontext';
      const encodedImageURL = encodeURIComponent(publicUrl);
      targetUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&image=${encodedImageURL}&token=${apiToken}&referrer=${referrer}&nologo=true`;
    } else {
      const model = 'flux';
      targetUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&token=${apiToken}&referrer=${referrer}&nologo=true`;
    }

    addDebugLog(`[IA] Gerando imagem com a URL: ${targetUrl.substring(0, 200)}...`);
    const response = await fetchWithRetry(targetUrl, { addDebugLog, apiName: 'Imagem IA' });

    if (!response.ok) {
      const errorBody = await response.text();
      addDebugLog(`[IA] ERRO na API de imagem: ${errorBody}`);
      throw new Error(`A geração da imagem falhou com o status: ${response.status}`);
    }

    const blob = await response.blob();
    const file = new File([blob], `${prompt.slice(0, 30).replace(/\s/g, '_')}.png`, { type: 'image/png' });
    return { file, prompt };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    addDebugLog(`[IA] Falha na requisição: ${errorMessage}`);
    toast.error(`Falha ao gerar a imagem: ${errorMessage}`);
    return null;
  }
};