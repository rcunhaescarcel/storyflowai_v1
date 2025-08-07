import { useState, useCallback, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// Helper function to get a compatible font name for FFmpeg
const getCompatibleFont = (font: string): string => {
  // All fonts are mapped to Roboto, as it's the one we are loading dynamically.
  // The ASS file will request the font "Roboto". We are loading the font file
  // and saving it as "Roboto.ttf" in the virtual /fonts directory to ensure libass finds it.
  return 'Roboto';
};

// Função para criar legenda no formato ASS a partir de texto simples
const createASSSubtitle = (scene: Scene, duration: number): string => {
  const { subtitle, fontFamily, fontSize, fontColor, shadowColor } = scene;
  
  const hexToBGR = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `&H00${b.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${r.toString(16).padStart(2, '0')}&`;
  };

  const compatibleFont = getCompatibleFont(fontFamily);
  const primaryColor = hexToBGR(fontColor);
  const outlineColor = hexToBGR(shadowColor);

  const styleHeader = `[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${compatibleFont},${fontSize},${primaryColor},&H000000FF,${outlineColor},&H00000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1`;

  const eventsHeader = `[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

  const dialogue = `Dialogue: 0,0:00:00.00,0:00:${duration.toString().padStart(2, '0')}.00,Default,,0,0,0,,${subtitle}`;

  return `[Script Info]
Title: Viflow IA Subtitle
ScriptType: v4.00+

${styleHeader}

${eventsHeader}
${dialogue}`;
};

// Nova função para converter conteúdo SRT para ASS
const convertSRTtoASS = (srtText: string, scene: Scene): string => {
  const { fontFamily, fontSize, fontColor, shadowColor } = scene;

  const hexToBGR = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `&H00${b.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${r.toString(16).padStart(2, '0')}&`;
  };

  const compatibleFont = getCompatibleFont(fontFamily);
  const primaryColor = hexToBGR(fontColor);
  const outlineColor = hexToBGR(shadowColor);

  const styleHeader = `[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${compatibleFont},${fontSize},${primaryColor},&H000000FF,${outlineColor},&H00000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1`;

  const eventsHeader = `[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

  const dialogues = srtText
    .trim()
    .replace(/\r/g, '')
    .split('\n\n')
    .map(block => {
      const lines = block.split('\n');
      if (lines.length < 2) return null;
      
      const timeLineIndex = lines.findIndex(line => line.includes('-->'));
      if (timeLineIndex === -1) return null;

      const time = lines[timeLineIndex];
      const text = lines.slice(timeLineIndex + 1).join('\\N');
      
      if (!time || !text) return null;

      const [start, end] = time.split(' --> ');
      if (!start || !end) return null;

      const assStart = start.trim().replace(',', '.').slice(0, -1);
      const assEnd = end.trim().replace(',', '.').slice(0, -1);

      return `Dialogue: 0,${assStart},${assEnd},Default,,0,0,0,,${text}`;
    })
    .filter(Boolean)
    .join('\n');

  return `[Script Info]
Title: Viflow IA Subtitle
ScriptType: v4.00+

${styleHeader}

${eventsHeader}
${dialogues}
`;
};

export interface Scene {
  id: string;
  image?: File;
  imagePreview?: string;
  audio?: File;
  subtitle: string;
  srtFile?: File;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  shadowColor: string;
  effect: string;
  zoomEnabled: boolean;
  zoomIntensity: number;
  zoomDirection: 'in' | 'out';
  fadeInDuration: number;
  fadeOutDuration: number;
}

export const useFFmpeg = () => {
  const [ffmpeg] = useState(() => new FFmpeg());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFontLoaded, setIsFontLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [autoLoadAttempted, setAutoLoadAttempted] = useState(false);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setDebugLogs(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  const loadFFmpeg = useCallback(async (silent = false) => {
    if (isLoaded) {
      if (!silent) addDebugLog("FFmpeg já carregado.");
      return true;
    }
    if (!silent) addDebugLog("Iniciando carregamento do FFmpeg...");

    try {
      ffmpeg.on('log', ({ message }) => addDebugLog(`FFmpeg Log: ${message}`));
      ffmpeg.on('progress', ({ progress: p }) => setProgress(Math.round(p * 100)));

      await ffmpeg.load();
      setIsLoaded(true);
      addDebugLog('🎉 FFmpeg carregado e configurado com sucesso!');
      return true;
    } catch (error) {
      addDebugLog(`❌ ERRO CRÍTICO no carregamento: ${error.message}`);
      return false;
    }
  }, [ffmpeg, isLoaded]);

  const renderVideo = useCallback(async (scenes: Scene[]): Promise<string | null> => {
    addDebugLog(`🎬 Iniciando renderização de vídeo com ${scenes.length} cenas...`);
    
    if (!isLoaded) {
      addDebugLog('FFmpeg não carregado, tentando carregar agora...');
      if (!await loadFFmpeg()) {
        addDebugLog('❌ FALHA: Não foi possível carregar o FFmpeg.');
        return null;
      }
    }

    if (scenes.length === 0) {
      addDebugLog('❌ ERRO: Nenhuma cena para renderizar');
      throw new Error('No scenes to render');
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Load font if not already loaded
      if (!isFontLoaded) {
        addDebugLog('📥 Baixando arquivo de fonte (necessário apenas uma vez)...');
        const fontUrl = 'https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/Roboto-Regular.ttf';
        await ffmpeg.createDir('/fonts');
        await ffmpeg.writeFile('/fonts/Roboto.ttf', await fetchFile(fontUrl));
        addDebugLog('✅ Fonte carregada em /fonts/Roboto.ttf');
        setIsFontLoaded(true);
      }

      const sceneDuration = 5;
      
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        addDebugLog(`📝 Processando cena ${i + 1}/${scenes.length}`);
        
        if (scene.image) {
          await ffmpeg.writeFile(`image_${i}.jpg`, await fetchFile(scene.image));
        }
        
        if (scene.audio) {
          await ffmpeg.writeFile(`audio_${i}.mp3`, await fetchFile(scene.audio));
        }

        if (scene.srtFile) {
          addDebugLog(`🔄 Convertendo arquivo SRT para cena ${i}...`);
          const srtText = await scene.srtFile.text();
          const assContent = convertSRTtoASS(srtText, scene);
          await ffmpeg.writeFile(`subtitle_${i}.ass`, new TextEncoder().encode(assContent));
          addDebugLog(`✅ Arquivo SRT convertido para ASS com sucesso.`);
        } else if (scene.subtitle) {
          addDebugLog(`📝 Criando arquivo de legenda ASS para cena ${i}...`);
          const assContent = createASSSubtitle(scene, sceneDuration);
          await ffmpeg.writeFile(`subtitle_${i}.ass`, new TextEncoder().encode(assContent));
        }
      }

      let concatList = '';
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const outputName = `scene_${i}.mp4`;
        
        let cmd = ['-loop', '1', '-i', `image_${i}.jpg`];
        if (scene.audio) cmd.push('-i', `audio_${i}.mp3`);
        cmd.push('-t', sceneDuration.toString());

        let videoFilter = `scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30`;
        
        if (scene.zoomEnabled) {
          const zoomFactor = 1 + (scene.zoomIntensity / 100);
          const totalFrames = sceneDuration * 30;
          if (scene.zoomDirection === 'in') {
            videoFilter += `,zoompan=z=1+${(zoomFactor - 1) / totalFrames}*on:d=${totalFrames}:x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2)`;
          } else {
            videoFilter += `,zoompan=z=${zoomFactor}-${(zoomFactor - 1) / totalFrames}*on:d=${totalFrames}:x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2)`;
          }
        }
        
        if (scene.fadeInDuration > 0) videoFilter += `,fade=t=in:st=0:d=${scene.fadeInDuration}`;
        if (scene.fadeOutDuration > 0) videoFilter += `,fade=t=out:st=${sceneDuration - scene.fadeOutDuration}:d=${scene.fadeOutDuration}`;
        
        if (scene.srtFile || scene.subtitle) {
          addDebugLog(`🔤 Aplicando legenda com fonte Roboto usando o filtro 'subtitles'...`);
          videoFilter += `,subtitles=filename=subtitle_${i}.ass:fontsdir=/fonts`;
        }

        cmd.push('-vf', videoFilter, '-c:v', 'libx264', '-pix_fmt', 'yuv420p');
        if (scene.audio) cmd.push('-c:a', 'aac', '-shortest');
        else cmd.push('-an');
        cmd.push('-y', outputName);
        
        addDebugLog(`🔧 Comando FFmpeg cena ${i+1}: ${cmd.join(' ')}`);
        await ffmpeg.exec(cmd);
        concatList += `file '${outputName}'\n`;
      }

      await ffmpeg.writeFile('concat_list.txt', new TextEncoder().encode(concatList));
      await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'concat_list.txt', '-c', 'copy', '-y', 'final_video.mp4']);

      const data = await ffmpeg.readFile('final_video.mp4');
      const videoUrl = URL.createObjectURL(new Blob([new Uint8Array(data as Uint8Array)], { type: 'video/mp4' }));
      addDebugLog(`🎉 Renderização concluída! URL do vídeo: ${videoUrl.substring(0, 50)}...`);

      return videoUrl;

    } catch (error) {
      addDebugLog(`❌ ERRO na renderização: ${error.message}`);
      throw error;
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [ffmpeg, isLoaded, isFontLoaded, loadFFmpeg]);

  useEffect(() => {
    if (!autoLoadAttempted && !isLoaded) {
      setAutoLoadAttempted(true);
      loadFFmpeg(true);
    }
  }, [autoLoadAttempted, isLoaded, loadFFmpeg]);

  return {
    loadFFmpeg,
    renderVideo,
    isLoaded,
    isProcessing,
    progress,
    debugLogs,
    clearDebugLogs: () => setDebugLogs([])
  };
};