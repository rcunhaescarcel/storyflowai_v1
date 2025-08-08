import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Download, 
  CheckCircle, 
  Loader2, 
  Video,
  Play,
  AlertCircle 
} from "lucide-react";
import { toast } from "sonner";
import { useFFmpeg, Scene, SubtitleStyle } from "@/hooks/useFFmpeg";

const Render = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loadFFmpeg, renderVideo, isLoaded, isProcessing, progress: ffmpegProgress, debugLogs, clearDebugLogs } = useFFmpeg();
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'processing' | 'completed' | 'error'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState('');
  const [localProgress, setLocalProgress] = useState(0);

  const scenes: Scene[] = location.state?.scenes || [];

  useEffect(() => {
    if (scenes.length === 0) {
      navigate('/editor');
      return;
    }
    
    // Start rendering automatically
    startRendering();
  }, []);

  const startRendering = async () => {
    setStatus('loading');
    setCurrentStep('Carregando FFmpeg WebAssembly...');
    setLocalProgress(0);
    
    try {
      // First load FFmpeg if not loaded
      if (!isLoaded) {
        const loaded = await loadFFmpeg();
        if (!loaded) {
          throw new Error('Falha ao carregar FFmpeg');
        }
      }

      setStatus('processing');
      setCurrentStep('Iniciando renderização...');
      
      // Default subtitle style for rendering when not coming from editor
      const subtitleStyle: SubtitleStyle = {
        fontFamily: 'Arial',
        fontSize: 24,
        fontColor: '#FFFFFF',
        shadowColor: '#000000'
      };

      // Start the actual video rendering, passing null for global files and default volume
      const videoUrl = await renderVideo(scenes, null, null, subtitleStyle, 0.5, 'fullhd', null, 'top-right', 'alternate', 20, true, 0.5, 0.5);
      
      if (videoUrl) {
        setVideoUrl(videoUrl);
        setStatus('completed');
        setCurrentStep('Renderização concluída!');
        
        toast.success("Renderização Concluída!", {
          description: "Seu vídeo foi processado com sucesso usando FFmpeg WebAssembly",
        });
      } else {
        throw new Error('Falha na renderização do vídeo');
      }

    } catch (error) {
      console.error('Rendering error:', error);
      setStatus('error');
      setCurrentStep('Erro na renderização');
      toast.error("Erro na Renderização", {
        description: error instanceof Error ? error.message : "Ocorreu um erro durante o processamento",
      });
    }
  };

  const downloadVideo = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = 'storyflow-video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.info("Download Iniciado", {
        description: "O download do seu vídeo foi iniciado",
      });
    }
  };

  const renderAgain = () => {
    setStatus('idle');
    setLocalProgress(0);
    setVideoUrl(null);
    setCurrentStep('');
    startRendering();
  };

  // Use FFmpeg progress when processing, local progress otherwise
  const currentProgress = isProcessing ? ffmpegProgress : localProgress;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/editor')}
              className="hover:bg-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Editor
            </Button>
            <h1 className="text-2xl font-bold text-primary">Renderização FFmpeg</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Render Card */}
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-3">
              {(status === 'loading' || status === 'processing') && <Loader2 className="w-8 h-8 animate-spin text-primary" />}
              {status === 'completed' && <CheckCircle className="w-8 h-8 text-green-500" />}
              {status === 'error' && <AlertCircle className="w-8 h-8 text-destructive" />}
              {status === 'idle' && <Video className="w-8 h-8 text-primary" />}
              
              {status === 'loading' && 'Carregando FFmpeg...'}
              {status === 'processing' && 'Processando com FFmpeg...'}
              {status === 'completed' && 'Renderização Concluída!'}
              {status === 'error' && 'Erro na Renderização'}
              {status === 'idle' && 'Preparando Renderização...'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{Math.round(currentProgress)}%</span>
              </div>
              <Progress value={currentProgress} className="h-3" />
              {currentStep && (
                <p className="text-sm text-muted-foreground text-center">{currentStep}</p>
              )}
            </div>

            {/* FFmpeg Status */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Status do FFmpeg</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">FFmpeg:</span>
                  <span className="ml-2 font-medium">{isLoaded ? 'Carregado' : 'Carregando...'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Processando:</span>
                  <span className="ml-2 font-medium">{isProcessing ? 'Sim' : 'Não'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cenas:</span>
                  <span className="ml-2 font-medium">{scenes.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Formato:</span>
                  <span className="ml-2 font-medium">MP4 (H.264)</span>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Configurações do Vídeo</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Resolução:</span>
                  <span className="ml-2 font-medium">1920x1080</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Taxa de Frames:</span>
                  <span className="ml-2 font-medium">30 FPS</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duração/Cena:</span>
                  <span className="ml-2 font-medium">5 segundos</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Codec:</span>
                  <span className="ml-2 font-medium">libx264</span>
                </div>
              </div>
            </div>

            {/* Debug Console */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Console de Debug FFmpeg</h3>
                <Button variant="outline" size="sm" onClick={clearDebugLogs}>
                  Limpar Logs
                </Button>
              </div>
              <div className="bg-black/80 rounded p-3 max-h-40 overflow-y-auto text-xs font-mono">
                {debugLogs.length === 0 ? (
                  <div className="text-gray-400">Nenhum log ainda... Inicie a renderização para ver os logs em tempo real.</div>
                ) : (
                  debugLogs.map((log, index) => (
                    <div key={index} className={`mb-1 ${
                      log.includes('❌') || log.includes('ERRO') ? 'text-red-400' : 
                      log.includes('✅') || log.includes('sucesso') ? 'text-green-400' :
                      log.includes('⚠️') || log.includes('DICA') ? 'text-yellow-400' :
                      log.includes('🎬') || log.includes('🎉') ? 'text-blue-400' :
                      'text-gray-300'
                    }`}>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {status === 'completed' && (
                <>
                  <Button variant="default" onClick={downloadVideo} className="flex-1 sm:flex-none">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Vídeo MP4
                  </Button>
                  <Button variant="outline" onClick={renderAgain}>
                    <Play className="w-4 h-4 mr-2" />
                    Renderizar Novamente
                  </Button>
                </>
              )}
              
              {status === 'error' && (
                <Button variant="default" onClick={renderAgain}>
                  <Play className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
              )}
              
              {(status === 'loading' || status === 'processing') && (
                <div className="text-center text-sm text-muted-foreground">
                  Aguarde... Processando com FFmpeg WebAssembly
                </div>
              )}
            </div>

            {/* Technical Details */}
            {status === 'completed' && (
              <div className="border-t border-border pt-6 text-center">
                <h4 className="font-semibold mb-2">🎉 Tecnologia Utilizada</h4>
                <p className="text-sm text-muted-foreground">
                  Renderizado com <strong>FFmpeg WebAssembly</strong> diretamente no seu navegador!<br />
                  Sem upload para servidores - 100% processamento local.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scene Preview */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Prévia das Cenas</h2>
          <div className="grid gap-4">
            {scenes.map((scene, index) => (
              <Card key={scene.id} className="border-border bg-card/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {scene.imagePreview && (
                          <div className="w-16 h-10 bg-muted rounded overflow-hidden">
                            <img 
                              src={scene.imagePreview} 
                              alt="Scene" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {scene.audio && (
                          <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                            🎵 {scene.audio.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Render;