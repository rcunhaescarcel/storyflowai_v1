import { useState, useCallback, useEffect, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { useRender } from '@/contexts/RenderContext';

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
export type RenderStage = 'idle' | 'scenes' | 'concat' | 'final';

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
  return `[Script Info]\nTitle: StoryFlow Subtitle\nScriptType: v4.00+\n\n${styleHeader}\n\n${eventsHeader}\n${dialogues}`;
};

export interface Scene {
  id: string;
  image?: File;
  imagePreview?: string;
  imagePrompt?: string;
  audio?: File;
  audioDataUrl?: string;
  narrationText?: string;
  duration?: number;
  emotion?: string;
}

export const useFFmpeg = () => {
  const [ffmpeg] = useState(() => new FFmpeg());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFontLoaded, setIsFontLoaded] = useState(false);
  const [autoLoadAttempted, setAutoLoadAttempted] = useState(false);
  const renderStageRef = useRef({ stage: 'idle' as RenderStage, totalScenes: 0, currentScene: 0 });
  const { addLog, updateProgress, endRender } = useRender();

  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    addLog(logMessage);
    console.log(logMessage);
  }, [addLog]);

  const loadFFmpeg = useCallback(async (silent = false) => {
    if (isLoaded) {
      if (!silent) addDebugLog("FFmpeg já carregado.");
      return true;
    }
    if (!silent) addDebugLog("Iniciando carregamento do FFmpeg...");
    try {
      ffmpeg.on('log', ({ message }) => addDebugLog(`FFmpeg Log: ${message}`));
      ffmpeg.on('progress', ({ progress: p }) => {
        const { stage, totalScenes, currentScene } = renderStageRef.current;
        
        if (stage === 'idle' || totalScenes === 0) {
          updateProgress(Math.round(p * 100), stage);
          return;
        }

        const sceneGenerationWeight = 0.80;
        const concatenationWeight = 0.05;
        const finalizationWeight = 0.15;
        
        let overallProgress = 0;

        if (stage === 'scenes') {
          const sceneWeight = sceneGenerationWeight / totalScenes;
          const baseProgress = currentScene * sceneWeight;
          const currentSceneProgress = p * sceneWeight;
          overallProgress = baseProgress + currentSceneProgress;
        } else if (stage === 'concat') {
          const baseProgress = sceneGenerationWeight;
          overallProgress = baseProgress + (p * concatenationWeight);
        } else if (stage === 'final') {
          const baseProgress = sceneGenerationWeight + concatenationWeight;
          overallProgress = baseProgress + (p * finalizationWeight);
        }
        
        updateProgress(Math.min(100, Math.round(overallProgress * 100)), stage);
      });
      await ffmpeg.load();
      setIsLoaded(true);
      addDebugLog('🎉 FFmpeg carregado e configurado com sucesso!');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      addDebugLog(`❌ ERRO CRÍTICO no carregamento: ${message}`);
      return false;
    }
  }, [ffmpeg, isLoaded, addDebugLog, updateProgress]);

  const cancelRender = useCallback(async () => {
    addDebugLog('🛑 Cancelando renderização...');
    try {
      await ffmpeg.terminate();
      addDebugLog('✅ Processo FFmpeg terminado.');
    } catch (e) {
      addDebugLog(`⚠️ Erro ao tentar terminar o FFmpeg: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      endRender();
    }
  }, [ffmpeg, addDebugLog, endRender]);

  const concatenateAudio = useCallback(async (scenes: Scene[]): Promise<File | null> => {
    addDebugLog(`🎵 Iniciando concatenação de áudio para ${scenes.length} cenas...`);
    if (!isLoaded) {
      addDebugLog('FFmpeg não carregado, tentando carregar agora...');
      if (!await loadFFmpeg()) {
        addDebugLog('❌ FALHA: Não foi possível carregar o FFmpeg.');
        return null;
      }
    }
    const audioScenes = scenes.filter(s => s.audio);
    if (audioScenes.length === 0) {
      addDebugLog('⚠️ Nenhum áudio para concatenar.');
      return null;
    }

    try {
      let concatList = '';
      for (let i = 0; i < audioScenes.length; i++) {
        const scene = audioScenes[i];
        const fileName = `audio_${i}.mp3`;
        await ffmpeg.writeFile(fileName, await fetchFile(scene.audio!));
        concatList += `file '${fileName}'\n`;
      }

      await ffmpeg.writeFile('concat_audio_list.txt', new TextEncoder().encode(concatList));
      await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'concat_audio_list.txt', '-c', 'copy', '-y', 'full_narration.mp3']);
      
      const data = await ffmpeg.readFile('full_narration.mp3');
      const audioFile = new File([new Uint8Array(data as Uint8Array)], 'narracao_completa.mp3', { type: 'audio/mp3' });
      
      addDebugLog('✅ Concatenação de áudio concluída!');
      return audioFile;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      addDebugLog(`❌ ERRO na concatenação de áudio: ${message}`);
      throw error;
    }
  }, [ffmpeg, isLoaded, loadFFmpeg, addDebugLog]);

  const renderVideo = useCallback(async (
    scenes: Scene[],
    globalSrtFile: File | null,
    backgroundMusic: File | null,
    subtitleStyle: SubtitleStyle,
    backgroundMusicVolume: number,
    quality: 'hd' | 'fullhd',
    logoFile: File | null,
    logoPosition: LogoPosition,
    zoomEffect: 'none' | 'in' | 'out' | 'alternate',
    addFade: boolean,
    fadeInDuration: number,
    fadeOutDuration: number
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

    renderStageRef.current = { stage: 'idle', totalScenes: scenes.length, currentScene: 0 };
    updateProgress(0, 'idle');

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

      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        addDebugLog(`📝 Processando cena ${i + 1}/${scenes.length}`);
        if (scene.image) await ffmpeg.writeFile(`image_${i}.jpg`, await fetchFile(scene.image));
        if (scene.audio) await ffmpeg.writeFile(`audio_${i}.mp3`, await fetchFile(scene.audio));
      }

      let concatList = '';
      renderStageRef.current.stage = 'scenes';
      for (let i = 0; i < scenes.length; i++) {
        renderStageRef.current.currentScene = i;
        const scene = scenes[i];
        const sceneDuration = scene.duration || 5; // Use scene's duration or fallback to 5s
        addDebugLog(`  -> Duração da cena ${i + 1}: ${sceneDuration.toFixed(2)}s`);
        const outputName = `scene_${i}.mp4`;
        let cmd = ['-loop', '1', '-i', `image_${i}.jpg`];
        if (scene.audio) cmd.push('-i', `audio_${i}.mp3`);
        cmd.push('-t', sceneDuration.toString());
        
        let videoFilter = `scale=${resolution.width}:${resolution.height}:force_original_aspect_ratio=increase,crop=${resolution.width}:${resolution.height},fps=30`;
        
        if (zoomEffect !== 'none') {
          const zoomDirection = zoomEffect === 'alternate' ? (i % 2 === 0 ? 'in' : 'out') : zoomEffect;
          const zoomIntensity = 5;
          const zoomFactor = 1 + (zoomIntensity / 100);
          const totalFrames = sceneDuration * 30;
          videoFilter += `,zoompan=z=${zoomDirection === 'in' ? `1+${(zoomFactor - 1) / totalFrames}*on` : `${zoomFactor}-${(zoomFactor - 1) / totalFrames}*on`}:d=${totalFrames}:x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2)`;
        }
        
        if (addFade) {
          if (fadeInDuration > 0) videoFilter += `,fade=t=in:st=0:d=${fadeInDuration}`;
          if (fadeOutDuration > 0) {
            const fadeOutStartTime = Math.max(0, sceneDuration - fadeOutDuration);
            videoFilter += `,fade=t=out:st=${fadeOutStartTime}:d=${fadeOutDuration}`;
          }
        }
        
        cmd.push('-vf', videoFilter, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28', '-pix_fmt', 'yuv420p');
        if (scene.audio) {
          cmd.push('-c:a', 'aac');
        } else {
          cmd.push('-an');
        }
        cmd.push('-y', outputName);
        addDebugLog(`🔧 Comando FFmpeg cena ${i + 1}: ${cmd.join(' ')}`);
        await ffmpeg.exec(cmd);
        concatList += `file '${outputName}'\n`;
      }

      renderStageRef.current.stage = 'concat';
      await ffmpeg.writeFile('concat_list.txt', new TextEncoder().encode(concatList));
      await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'concat_list.txt', '-c', 'copy', '-y', 'concatenated.mp4']);
      addDebugLog('✅ Passagem 1 concluída: Cenas concatenadas em concatenated.mp4');

      // --- PASS 2: Add global audio, subtitles, and logo ---
      addDebugLog('--- PASSAGEM 2: Adicionando trilha sonora, legendas e logotipo ---');
      renderStageRef.current.stage = 'final';
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

      const needsFilterComplex = backgroundMusic || logoFile || globalSrtFile;

      if (!needsFilterComplex) {
        addDebugLog('ℹ️ Nenhum filtro global aplicado. Copiando vídeo concatenado.');
        finalCmd.push('-c', 'copy', '-y', 'final_video.mp4');
      } else {
        let videoFilterChain = '[0:v]';
        let audioFilterChain = '';
        let filterComplexParts = [];
        let hasVideoFilters = false;

        if (logoFile) {
            const logoInputIndex = backgroundMusic ? '[2:v]' : '[1:v]';
            const positionMap = {
                'top-left': '15:15',
                'top-right': 'main_w-overlay_w-15:15',
                'bottom-left': '15:main_h-overlay_h-15',
                'bottom-right': 'main_w-overlay_w-15:main_h-overlay_h-15',
            };
            videoFilterChain += `${logoInputIndex}overlay=${positionMap[logoPosition]}`;
            hasVideoFilters = true;
        }
        if (globalSrtFile) {
            videoFilterChain += `${hasVideoFilters ? ',' : ''}subtitles=filename=global_subtitle.ass:fontsdir=.`;
            hasVideoFilters = true;
        }

        if (!hasVideoFilters) {
            videoFilterChain += 'null';
        }
        filterComplexParts.push(`${videoFilterChain}[v_out]`);

        if (backgroundMusic) {
            const musicInput = '[1:a]';
            audioFilterChain = `[0:a]volume=1.0[a1];${musicInput}volume=${backgroundMusicVolume}[a2];[a1][a2]amix=inputs=2:duration=first[a_out]`;
        } else {
            audioFilterChain = `[0:a]acopy[a_out]`;
        }
        filterComplexParts.push(audioFilterChain);
        
        finalCmd.push('-filter_complex', filterComplexParts.join(';'));
        finalCmd.push('-map', '[v_out]', '-map', '[a_out]');
        finalCmd.push('-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28', '-c:a', 'aac', '-y', 'final_video.mp4');
      }

      addDebugLog(`🔧 Comando FFmpeg final: ${finalCmd.join(' ')}`);
      await ffmpeg.exec(finalCmd);

      const data = await ffmpeg.readFile('final_video.mp4');
      const videoUrl = URL.createObjectURL(new Blob([new Uint8Array(data as Uint8Array)], { type: 'video/mp4' }));
      addDebugLog(`🎉 Renderização concluída!`);
      updateProgress(100, 'final');
      return videoUrl;

    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      if (message.includes('exit') || message.includes('terminate')) {
        addDebugLog(`🛑 Renderização cancelada pelo usuário.`);
        throw new Error('Renderização cancelada pelo usuário.');
      } else {
        addDebugLog(`❌ ERRO na renderização: ${message}`);
        throw error;
      }
    } finally {
      renderStageRef.current.stage = 'idle';
      endRender();
    }
  }, [ffmpeg, isLoaded, isFontLoaded, loadFFmpeg, addDebugLog, updateProgress, endRender]);

  useEffect(() => {
    if (!autoLoadAttempted && !isLoaded) {
      setAutoLoadAttempted(true);
      loadFFmpeg(true);
    }
  }, [autoLoadAttempted, isLoaded, loadFFmpeg]);

  return {
    loadFFmpeg,
    renderVideo,
    concatenateAudio,
    isLoaded,
    addDebugLog,
    cancelRender,
  };
};