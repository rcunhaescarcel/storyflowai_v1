import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!file) return reject("No file provided");
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
    };
  });
};

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const fetchWithRetry = async (
  url: string, 
  { retries = 3, delayMs = 2000, addDebugLog, apiName = 'API' }: { retries?: number, delayMs?: number, addDebugLog: (msg: string) => void, apiName?: string }
): Promise<Response> => {
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