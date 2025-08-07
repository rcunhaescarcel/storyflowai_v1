import { useState, useCallback, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const getCompatibleFont = (font: string): string => {
  return 'Arial';
};

export interface SubtitleStyle {
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  shadowColor: string;
}

export type LogoPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const convertSRTtoASS = (srtText: string, style: SubtitleStyle): string => {
  const { fontFamily, fontSize, fontColor, shadowColor } = style;
  const hexToBGR = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `&H00${b.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${r.toString(16).padStart(2, '0')}&`;
  };
  const compatibleFont = getCompatibleFont(fontFamily);
  const primaryColor = hexToBGR(fontColor);
  const outlineColor = hexToBGR(shadowColor);
  const styleHeader = `[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,${compatibleFont},${fontSize},${primaryColor},&H000000FF,${outlineColor},&H00000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1`;
  const eventsHeader = `[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;
  const dialogues = srtText.trim().replace(/\r/g, '').split('\n\n').map(block => {
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
  }).filter(Boolean).join('\n');
  return `[Script Info]\nTitle: Viflow IA Subtitle\nScriptType: v4.00+\n\n${styleHeader}\n\n${eventsHeader}\n${dialogues}`;
};

export interface Scene {
  id: string;
  image?: File;
  imagePreview?: string;
  audio?: File; // Per-scene narration
  narrationText?: string; // Text for generating narration
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

  const renderVideo = useCallback(async (
    scenes: Scene[],
    globalSrtFile: File | null,
    backgroundMusic: File | null,
    subtitleStyle: SubtitleStyle,
    backgroundMusicVolume: number,
    quality: 'hd' | 'fullhd',
    logoFile: File | null,
    logoPosition: LogoPosition
  ): Promise<string | null> => {
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

    const resolution = quality === 'fullhd' ? { width: 1920, height: 1080 } : { width: 1280, height: 720 };
    addDebugLog(`📹 Qualidade selecionada: ${quality.toUpperCase()} (${resolution.width}x${resolution.height})`);

    try {
      // --- PASS 1: Create individual scene clips ---
      addDebugLog('--- PASSAGEM 1: Criando clipes de cena individuais ---');
      if (!isFontLoaded) {
        addDebugLog('📥 Baixando arquivo de fonte (Arial)...');
        const fontUrl = 'https://0eeb6b826f9e83756195697eae0f522e.cdn.bubble.io/f1749513085962x560310166625130240/Arial.otf';
        await ffmpeg.writeFile('Arial.otf', await fetchFile(fontUrl));
        addDebugLog('✅ Fonte carregada em /Arial.otf (raiz)');
        setIsFontLoaded(true);
      }

      const sceneDuration = 5;
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        addDebugLog(`📝 Processando cena ${i + 1}/${scenes.length}`);
        if (scene.image) await ffmpeg.writeFile(`image_${i}.jpg`, await fetchFile(scene.image));
        if (scene.audio) await ffmpeg.writeFile(`audio_${i}.mp3`, await fetchFile(scene.audio));
      }

      let concatList = '';
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const outputName = `scene_${i}.mp4`;
        let cmd = ['-loop', '1', '-i', `image_${i}.jpg`];
        if (scene.audio) cmd.push('-i', `audio_${i}.mp3`);
        cmd.push('-t', sceneDuration.toString());
        let videoFilter = `scale=${resolution.width}:${resolution.height}:force_original_aspect_ratio=increase,crop=${resolution.width}:${resolution.height},fps=30`;
        if (scene.zoomEnabled) {
          const zoomFactor = 1 + (scene.zoomIntensity / 100);
          const totalFrames = sceneDuration * 30;
          videoFilter += `,zoompan=z=${scene.zoomDirection === 'in' ? `1+${(zoomFactor - 1) / totalFrames}*on` : `${zoomFactor}-${(zoomFactor - 1) / totalFrames}*on`}:d=${totalFrames}:x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2)`;
        }
        if (scene.fadeInDuration > 0) videoFilter += `,fade=t=in:st=0:d=${scene.fadeInDuration}`;
        if (scene.fadeOutDuration > 0) videoFilter += `,fade=t=out:st=${sceneDuration - scene.fadeOutDuration}:d=${scene.fadeOutDuration}`;
        
        cmd.push('-vf', videoFilter, '-c:v', 'libx264', '-pix_fmt', 'yuv420p');
        if (scene.audio) cmd.push('-c:a', 'aac', '-shortest'); else cmd.push('-an');
        cmd.push('-y', outputName);
        addDebugLog(`🔧 Comando FFmpeg cena ${i + 1}: ${cmd.join(' ')}`);
        await ffmpeg.exec(cmd);
        concatList += `file '${outputName}'\n`;
      }

      await ffmpeg.writeFile('concat_list.txt', new TextEncoder().encode(concatList));
      await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'concat_list.txt', '-c', 'copy', '-y', 'concatenated.mp4']);
      addDebugLog('✅ Passagem 1 concluída: Cenas concatenadas em concatenated.mp4');

      // --- PASS 2: Add global audio, subtitles, and logo ---
      addDebugLog('--- PASSAGEM 2: Adicionando trilha sonora, legendas e logotipo ---');
      if (globalSrtFile) {
        const srtText = await globalSrtFile.text();
        const assContent = convertSRTtoASS(srtText, subtitleStyle);
        await ffmpeg.writeFile('global_subtitle.ass', new TextEncoder().encode(assContent));
        addDebugLog('✅ Legenda global convertida para ASS.');
      }
      if (backgroundMusic) {
        await ffmpeg.writeFile('background_music.mp3', await fetchFile(backgroundMusic));
        addDebugLog('✅ Trilha sonora de fundo carregada.');
      }
      if (logoFile) {
        await ffmpeg.writeFile('logo.png', await fetchFile(logoFile));
        addDebugLog('✅ Logotipo carregado.');
      }

      let finalCmd = ['-i', 'concatenated.mp4'];
      if (backgroundMusic) finalCmd.push('-i', 'background_music.mp3');
      if (logoFile) finalCmd.push('-i', 'logo.png');

      let filterComplex = [];
      let mapCmd = [];

      let videoInput = '[0:v]';
      let audioInput = '[0:a]';

      // Logo Overlay
      if (logoFile) {
        const logoInput = backgroundMusic ? '[2:v]' : '[1:v]';
        const positionMap = {
          'top-left': '15:15',
          'top-right': 'main_w-overlay_w-15:15',
          'bottom-left': '15:main_h-overlay_h-15',
          'bottom-right': 'main_w-overlay_w-15:main_h-overlay_h-15',
        };
        filterComplex.push(`${videoInput}${logoInput}overlay=${positionMap[logoPosition]}[v_with_logo]`);
        videoInput = '[v_with_logo]';
      }

      // Subtitles
      if (globalSrtFile) {
        filterComplex.push(`${videoInput}subtitles=filename=global_subtitle.ass:fontsdir=.[v_out]`);
        mapCmd.push('-map', '[v_out]');
      } else {
        mapCmd.push('-map', videoInput);
      }

      // Audio Mix
      if (backgroundMusic) {
        const musicInput = '[1:a]';
        filterComplex.push(`${audioInput}volume=1.0[a_narration];${musicInput}volume=${backgroundMusicVolume}[a_music];[a_narration][a_music]amix=inputs=2:duration=first[a_out]`);
        mapCmd.push('-map', '[a_out]');
      } else {
        mapCmd.push('-map', `${audioInput}?`);
      }

      if (filterComplex.length > 0) {
        finalCmd.push('-filter_complex', filterComplex.join(';'));
      }
      finalCmd.push(...mapCmd);
      finalCmd.push('-c:v', 'libx264', '-c:a', 'aac', '-y', 'final_video.mp4');

      addDebugLog(`🔧 Comando FFmpeg final: ${finalCmd.join(' ')}`);
      await ffmpeg.exec(finalCmd);

      const data = await ffmpeg.readFile('final_video.mp4');
      const videoUrl = URL.createObjectURL(new Blob([new Uint8Array(data as Uint8Array)], { type: 'video/mp4' }));
      addDebugLog(`🎉 Renderização concluída!`);
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