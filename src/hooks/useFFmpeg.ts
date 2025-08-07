import { useState, useCallback, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface Scene {
  id: string;
  image?: File;
  imagePreview?: string;
  audio?: File;
  subtitle: string;
  srtFile?: File; // Novo campo para arquivo SRT
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  shadowColor: string;
  effect: string;
  // Zoom properties
  zoomEnabled: boolean;
  zoomIntensity: number;
  zoomDirection: 'in' | 'out';
  // Fade properties
  fadeInDuration: number;
  fadeOutDuration: number;
}

export const useFFmpeg = () => {
  const [ffmpeg] = useState(() => new FFmpeg());
  const [isLoaded, setIsLoaded] = useState(false);
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
    if (!silent) addDebugLog("Iniciando carregamento do FFmpeg...");
    if (!silent) addDebugLog(`Estado atual - isLoaded: ${isLoaded}`);
    
    if (isLoaded) {
      if (!silent) addDebugLog("FFmpeg já carregado, retornando...");
      return true;
    }

    try {
      // Verificar se cross-origin isolation está disponível
      addDebugLog(`crossOriginIsolated: ${typeof window !== 'undefined' ? window.crossOriginIsolated : 'N/A'}`);
      addDebugLog(`SharedArrayBuffer disponível: ${typeof SharedArrayBuffer !== 'undefined'}`);
      
      if (typeof window !== 'undefined' && !window.crossOriginIsolated) {
        addDebugLog('⚠️ Cross-origin isolation não disponível. Isto pode causar problemas.');
      }

      // Configurar event listeners
      addDebugLog('Configurando event listeners do FFmpeg...');
      
      ffmpeg.on('log', ({ message }) => {
        addDebugLog(`FFmpeg Log: ${message}`);
      });
      
      ffmpeg.on('progress', ({ progress: p }) => {
        const progressPercent = Math.round(p * 100);
        addDebugLog(`FFmpeg Progress: ${progressPercent}%`);
        setProgress(progressPercent);
      });

      // Tentar carregar usando a versão multi-threaded como no Bubble
      addDebugLog('Tentando carregar FFmpeg core MT...');
      
      // Primeiro, tentar com a versão MT simplificada (como no Bubble)
      try {
        await ffmpeg.load();
        addDebugLog('✅ FFmpeg carregado com sucesso usando load() padrão!');
      } catch (defaultError) {
        addDebugLog(`❌ Falha no load() padrão: ${defaultError.message}`);
        
        // Fallback para especificar URLs manualmente
        addDebugLog('Tentando fallback com URLs específicas...');
        const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/umd';
        
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        addDebugLog('✅ FFmpeg carregado com URLs específicas!');
      }

      setIsLoaded(true);
      addDebugLog('🎉 FFmpeg carregado e configurado com sucesso!');
      return true;
      
    } catch (error) {
      addDebugLog(`❌ ERRO CRÍTICO no carregamento: ${error.message}`);
      addDebugLog(`Stack trace: ${error.stack}`);
      
      if (error?.message?.includes('SharedArrayBuffer')) {
        addDebugLog('🔧 DICA: SharedArrayBuffer não disponível. Verifique headers COOP/COEP.');
      }
      if (error?.message?.includes('network')) {
        addDebugLog('🔧 DICA: Erro de rede. Verifique conectividade.');
      }
      if (error?.message?.includes('wasm')) {
        addDebugLog('🔧 DICA: Erro no WebAssembly. Navegador pode não suportar.');
      }
      
      return false;
    }
  }, [ffmpeg, isLoaded]);

  const renderVideo = useCallback(async (scenes: Scene[]): Promise<string | null> => {
    addDebugLog(`🎬 Iniciando renderização de vídeo...`);
    addDebugLog(`Parâmetros: ${scenes.length} cenas, FFmpeg loaded: ${isLoaded}`);
    
    if (!isLoaded) {
      addDebugLog('FFmpeg não carregado, tentando carregar agora...');
      const loaded = await loadFFmpeg();
      if (!loaded) {
        addDebugLog('❌ FALHA: Não foi possível carregar o FFmpeg para renderização');
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
      // Carregar fontes personalizadas
      const loadCustomFonts = async () => {
        try {
          addDebugLog('🔤 Carregando fontes personalizadas...');
          
          // Criar diretório /tmp se não existir
          try {
            await ffmpeg.listDir('/tmp');
          } catch {
            addDebugLog('📁 Criando diretório /tmp para fontes...');
            // O FFmpeg criará automaticamente quando necessário
          }
          
          // Carregar uma fonte básica no diretório /tmp
          // Usar uma fonte simples que o FFmpeg pode renderizar
          const basicFontData = `<?xml version="1.0" encoding="UTF-8"?>
<fontconfig>
  <dir>/tmp</dir>
  <match target="font">
    <test name="family" qual="any">
      <string>Arial</string>
    </test>
    <edit name="family" mode="assign" binding="same">
      <string>sans-serif</string>
    </edit>
  </match>
</fontconfig>`;
          
          try {
            await ffmpeg.writeFile('/tmp/fontconfig.xml', basicFontData);
            addDebugLog('✅ Arquivo de configuração de fonte criado em /tmp/fontconfig.xml');
          } catch (error) {
            addDebugLog(`⚠️ Erro ao criar arquivo de fonte: ${error}`);
          }
          
          // Lista de fontes padrão do sistema (disponíveis no FFmpeg)
          const systemFonts = [
            'Arial',
            'Helvetica', 
            'Times',
            'Courier',
            'Georgia',
            'Verdana',
            'Impact'
          ];
          
          addDebugLog(`✅ Fontes do sistema disponíveis: ${systemFonts.join(', ')}`);
          
        } catch (error) {
          addDebugLog(`⚠️ Erro ao carregar fontes: ${error}`);
        }
      };
      
      await loadCustomFonts();
      
      // Duração padrão por cena (em segundos)
      const sceneDuration = 5;
      addDebugLog(`📽️ Renderizando ${scenes.length} cenas, ${sceneDuration}s cada`);
      
      // Preparar arquivos de entrada
      addDebugLog('📁 Preparando arquivos de entrada...');
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        addDebugLog(`📝 Processando cena ${i + 1}/${scenes.length}`);
        
        // Converter imagem para o FFmpeg
        if (scene.image) {
          addDebugLog(`🖼️ Escrevendo arquivo de imagem para cena ${i}`);
          const imageData = await fetchFile(scene.image);
          await ffmpeg.writeFile(`image_${i}.jpg`, imageData);
        } else {
          addDebugLog(`⚠️ Cena ${i} não tem imagem`);
        }
        
        // Converter áudio para o FFmpeg
        if (scene.audio) {
          addDebugLog(`🎵 Escrevendo arquivo de áudio para cena ${i}`);
          const audioData = await fetchFile(scene.audio);
          await ffmpeg.writeFile(`audio_${i}.mp3`, audioData);
        }

        // Processar arquivo SRT se disponível
        if (scene.srtFile) {
          addDebugLog(`📝 Escrevendo arquivo SRT para cena ${i}`);
          addDebugLog(`📄 Nome do arquivo SRT: ${scene.srtFile.name}`);
          addDebugLog(`📊 Tamanho do arquivo SRT: ${scene.srtFile.size} bytes`);
          
          try {
            const srtData = await fetchFile(scene.srtFile);
            await ffmpeg.writeFile(`subtitle_${i}.srt`, srtData);
            addDebugLog(`✅ Arquivo SRT ${scene.srtFile.name} escrito com sucesso`);
            
            // Verificar se o arquivo foi realmente criado
            const files = await ffmpeg.listDir('/');
            const srtExists = files.some(f => f.name === `subtitle_${i}.srt`);
            addDebugLog(`🔍 Verificação: arquivo subtitle_${i}.srt existe: ${srtExists}`);
            
            // Ler o arquivo de volta para verificar o conteúdo
            if (srtExists) {
              try {
                const srtContent = await ffmpeg.readFile(`subtitle_${i}.srt`);
                const srtText = new TextDecoder().decode(srtContent);
                addDebugLog(`📄 Arquivo lido de volta: ${srtText.substring(0, 200)}...`);
              } catch (readError) {
                addDebugLog(`⚠️ Erro ao ler arquivo SRT: ${readError}`);
              }
            }
          } catch (srtError) {
            addDebugLog(`❌ Erro ao processar arquivo SRT: ${srtError}`);
            throw srtError;
          }
        } else if (scene.subtitle) {
          // Criar arquivo de legenda ASS apenas se não houver arquivo SRT
          addDebugLog(`📝 Criando arquivo de legenda ASS para cena ${i}`);
          const assContent = createASSSubtitle(scene, sceneDuration);
          await ffmpeg.writeFile(`subtitle_${i}.ass`, new TextEncoder().encode(assContent));
        }
      }

      // Criar lista de concatenação
      let concatList = '';

      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const outputName = `scene_${i}.mp4`;
        
        addDebugLog(`📽️ Construindo comando para cena ${i + 1}`);
        
        // Comando correto: TODOS OS INPUTS PRIMEIRO, depois opções
        let cmd = [];
        
        // 1. Input da imagem (sempre presente)
        cmd.push('-loop', '1', '-i', `image_${i}.jpg`);
        
        // 2. Input do áudio (se disponível)  
        if (scene.audio) {
          addDebugLog(`🎵 Adicionando input de áudio para cena ${i}`);
          cmd.push('-i', `audio_${i}.mp3`);
        }
        
        // 3. Opções globais
        cmd.push('-t', sceneDuration.toString());

        // 4. Construir filtros de vídeo
        let videoFilter = `scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30`;
        
        // Adicionar efeito de zoom se habilitado
        if (scene.zoomEnabled) {
          addDebugLog(`🔍 Adicionando efeito de zoom para cena ${i}`);
          const zoomFactor = 1 + (scene.zoomIntensity / 100);
          const totalFrames = sceneDuration * 30;
          
          if (scene.zoomDirection === 'in') {
            // Zoom in: começa em 1 e vai até zoomFactor
            videoFilter += `,zoompan=z=1+${(zoomFactor - 1) / totalFrames}*on:d=${totalFrames}:x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2)`;
          } else {
            // Zoom out: começa em zoomFactor e vai até 1
            videoFilter += `,zoompan=z=${zoomFactor}-${(zoomFactor - 1) / totalFrames}*on:d=${totalFrames}:x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2)`;
          }
        }
        
        // Adicionar efeito de fade
        if (scene.fadeInDuration > 0) {
          addDebugLog(`🎭 Adicionando fade in para cena ${i}`);
          videoFilter += `,fade=t=in:st=0:d=${scene.fadeInDuration}`;
        }
        if (scene.fadeOutDuration > 0) {
          addDebugLog(`🎭 Adicionando fade out para cena ${i}`);
          const fadeOutStart = sceneDuration - scene.fadeOutDuration;
          videoFilter += `,fade=t=out:st=${fadeOutStart}:d=${scene.fadeOutDuration}`;
        }
        
        // Adicionar legenda se disponível
        if (scene.srtFile) {
          addDebugLog(`📝 Adicionando legenda SRT para cena ${i}: ${scene.srtFile.name}`);
          
          // Verificar novamente se o arquivo existe antes de aplicar
          try {
            const files = await ffmpeg.listDir('/');
            const srtExists = files.some(f => f.name === `subtitle_${i}.srt`);
            if (srtExists) {
              addDebugLog(`✅ Arquivo SRT encontrado: subtitle_${i}.srt`);
            } else {
              addDebugLog(`❌ Arquivo SRT NÃO encontrado: subtitle_${i}.srt`);
              addDebugLog(`📂 Arquivos disponíveis: ${files.map(f => f.name).join(', ')}`);
            }
          } catch (listError) {
            addDebugLog(`⚠️ Erro ao listar arquivos: ${listError}`);
          }
          
          // Mapear fonte para versão compatível com FFmpeg
          const getCompatibleFont = (font: string): string => {
            const fontMap: { [key: string]: string } = {
              'Poppins': 'Arial',
              'Roboto': 'Arial',
              'Helvetica': 'Arial',
              'Times New Roman': 'Times',
              'Courier New': 'Courier',
              'Verdana': 'Arial',
              'Georgia': 'Georgia',
              'Impact': 'Impact',
              'Comic Sans MS': 'Arial'
            };
            return fontMap[font] || 'Arial';
          };
          
          const compatibleFont = getCompatibleFont(scene.fontFamily);
          addDebugLog(`🔤 Fonte original: ${scene.fontFamily} → Compatível: ${compatibleFont}`);
          
          // Aplicar subtitles com força de estilo mais compatível
          addDebugLog(`🎬 Tentando aplicar legenda SRT para cena ${i}`);
          // Usar filtro simples sem fontsdir para evitar problemas de fonte
          videoFilter += `,subtitles=subtitle_${i}.srt`;
          addDebugLog(`🎬 Filtro de legenda SRT (método simples): subtitles=subtitle_${i}.srt`);
        } else if (scene.subtitle && scene.subtitle.trim()) {
          addDebugLog(`📝 Adicionando legenda ASS para cena ${i}`);
          addDebugLog(`🔤 Fonte para ASS: ${scene.fontFamily} → ${getCompatibleFont(scene.fontFamily)}`);
          videoFilter += `,ass=subtitle_${i}.ass`;
        }

        // 5. Aplicar filtros de vídeo
        cmd.push('-vf', videoFilter);

        // 6. Configurações de codec de vídeo
        cmd.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p');

        // 7. Configurar áudio
        if (scene.audio) {
          cmd.push('-c:a', 'aac', '-shortest');
        } else {
          cmd.push('-an'); // Sem áudio
        }

        // 8. Output file
        cmd.push('-y', outputName);
        
        addDebugLog(`🔧 Comando FFmpeg: ${cmd.join(' ')}`);
        
        try {
          await ffmpeg.exec(cmd);
          addDebugLog(`✅ Cena ${i + 1} renderizada com sucesso`);
        } catch (sceneError) {
          addDebugLog(`❌ Falha ao renderizar cena ${i + 1}: ${sceneError}`);
          throw sceneError;
        }
        
        concatList += `file 'scene_${i}.mp4'\n`;
      }

      // Escrever lista de concatenação
      addDebugLog('📋 Criando lista de concatenação...');
      await ffmpeg.writeFile('concat_list.txt', new TextEncoder().encode(concatList));
      addDebugLog(`Lista de concatenação:\n${concatList}`);

      // Concatenar todas as cenas
      addDebugLog('🔗 Concatenando todas as cenas...');
      await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat_list.txt',
        '-c', 'copy',
        '-y', 'final_video.mp4'
      ]);

      // Ler o arquivo final
      addDebugLog('📁 Lendo arquivo final de vídeo...');
      const data = await ffmpeg.readFile('final_video.mp4');
      addDebugLog(`📊 Tamanho do vídeo: ${data.length} bytes`);
      
      const videoBlob = new Blob([data], { type: 'video/mp4' });
      const videoUrl = URL.createObjectURL(videoBlob);
      addDebugLog(`🎬 URL do vídeo criada: ${videoUrl.substring(0, 50)}...`);

      return videoUrl;

    } catch (error) {
      addDebugLog(`❌ ERRO na renderização: ${error}`);
      addDebugLog(`Stack: ${error.stack}`);
      throw error;
    } finally {
      setIsProcessing(false);
      setProgress(0);
      addDebugLog('🏁 Processo de renderização finalizado');
    }
  }, [ffmpeg, isLoaded, loadFFmpeg]);

  // Auto-load FFmpeg when hook is first used
  useEffect(() => {
    if (!autoLoadAttempted && !isLoaded) {
      setAutoLoadAttempted(true);
      loadFFmpeg(true); // Silent loading
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

// Função para criar legenda no formato ASS
const createASSSubtitle = (scene: Scene, duration: number): string => {
  const { subtitle, fontFamily, fontSize, fontColor, shadowColor } = scene;
  
  // Mapear fontes para versões compatíveis com FFmpeg
  const getCompatibleFont = (font: string): string => {
    const fontMap: { [key: string]: string } = {
      'Poppins': 'Arial',
      'Roboto': 'Arial',
      'Helvetica': 'Arial',
      'Times New Roman': 'Times',
      'Courier New': 'Courier',
      'Verdana': 'Arial',
      'Georgia': 'Georgia',
      'Impact': 'Impact',
      'Comic Sans MS': 'Arial'
    };
    
    return fontMap[font] || 'Arial';
  };
  
  // Converter cor hex para formato ASS (BGR)
  const hexToBGR = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `&H00${b.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${r.toString(16).padStart(2, '0')}&`;
  };

  const compatibleFont = getCompatibleFont(fontFamily);
  const primaryColor = hexToBGR(fontColor);
  const outlineColor = hexToBGR(shadowColor);

  return `[Script Info]
Title: Viflow IA Subtitle
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${compatibleFont},${fontSize},${primaryColor},&H000000FF,${outlineColor},&H00000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:${duration.toString().padStart(2, '0')}.00,Default,,0,0,0,,${subtitle}`;
};