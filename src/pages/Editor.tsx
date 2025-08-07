import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Upload, 
  Trash2, 
  Video, 
  ArrowLeft,
  Settings,
  Music,
  Image as ImageIcon,
  ZoomIn,
  Sparkles,
  FileVideo,
  Clock,
  Download,
  Globe,
  Palette
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Scene, useFFmpeg, SubtitleStyle } from "@/hooks/useFFmpeg";

const Editor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [globalSrtFile, setGlobalSrtFile] = useState<File | null>(null);
  const [backgroundMusic, setBackgroundMusic] = useState<File | null>(null);
  
  // Global Subtitle Styles
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState("#ffffff");
  const [shadowColor, setShadowColor] = useState("#000000");

  const { 
    renderVideo, 
    isProcessing, 
    progress, 
    debugLogs, 
    clearDebugLogs 
  } = useFFmpeg();
  
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const addNewScene = () => {
    const newScene: Scene = {
      id: crypto.randomUUID(),
      effect: "fade",
      zoomEnabled: false,
      zoomIntensity: 20,
      zoomDirection: "in",
      fadeInDuration: 0.5,
      fadeOutDuration: 0.5
    };
    setScenes([...scenes, newScene]);
  };

  const updateScene = (id: string, updates: Partial<Scene>) => {
    setScenes(scenes.map(scene => 
      scene.id === id ? { ...scene, ...updates } : scene
    ));
  };

  const deleteScene = (id: string) => {
    setScenes(scenes.filter(scene => scene.id !== id));
  };

  const handleImageUpload = (sceneId: string, file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateScene(sceneId, { 
          image: file, 
          imagePreview: e.target?.result as string 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNarrationUpload = (sceneId: string, file: File) => {
    if (file && file.type.startsWith('audio/')) {
      updateScene(sceneId, { audio: file });
      toast({
        title: "Narração carregada",
        description: "Áudio de narração adicionado à cena.",
      });
    }
  };

  const handleSrtUpload = (file: File) => {
    if (file && (file.name.endsWith('.srt') || file.type === 'text/plain')) {
      setGlobalSrtFile(file);
      toast({
        title: "Legenda Global Carregada",
        description: "Arquivo SRT será aplicado a todo o vídeo.",
      });
    }
  };

  const handleBackgroundMusicUpload = (file: File) => {
    if (file && file.type.startsWith('audio/')) {
      setBackgroundMusic(file);
      toast({
        title: "Trilha Sonora Carregada",
        description: "A música de fundo será aplicada a todo o vídeo.",
      });
    }
  };

  const handleRenderVideo = async () => {
    if (scenes.length === 0) {
      toast({ title: "Erro", description: "Adicione pelo menos uma cena para renderizar", variant: "destructive" });
      return;
    }
    if (scenes.some(scene => !scene.image)) {
      toast({ title: "Aviso", description: "Todas as cenas precisam de uma imagem para renderizar.", variant: "destructive" });
      return;
    }

    try {
      setVideoUrl(null);
      clearDebugLogs();
      const subtitleStyle: SubtitleStyle = { fontFamily, fontSize, fontColor, shadowColor };
      const result = await renderVideo(scenes, globalSrtFile, backgroundMusic, subtitleStyle);
      if (result) {
        setVideoUrl(result);
        toast({ title: "Sucesso!", description: "Vídeo renderizado com sucesso" });
      } else {
        toast({ title: "Erro", description: "Falha ao renderizar o vídeo", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Erro na Renderização", description: `${error}`, variant: "destructive" });
    }
  };

  const downloadVideo = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = 'viflow-video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="hover:bg-gray-100 text-gray-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Viflow IA Editor</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-white/80 text-gray-700">
              {scenes.length} cena{scenes.length !== 1 ? 's' : ''}
            </Badge>
            <Button onClick={handleRenderVideo} disabled={scenes.length === 0 || isProcessing} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isProcessing ? <><Clock className="w-4 h-4 mr-2 animate-spin" />Renderizando...</> : <><Video className="w-4 h-4 mr-2" />Renderizar Vídeo</>}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {scenes.length === 0 && (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Video className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Crie Sua Primeira Cena</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">Adicione imagens e narrações para começar a criar seu vídeo.</p>
                <Button onClick={addNewScene} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Nova Cena
                </Button>
              </div>
            )}

            <div className="space-y-6">
              {scenes.map((scene, index) => (
                <Card key={scene.id} className="bg-white/80 backdrop-blur-sm border-gray-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Cena {index + 1}</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => deleteScene(scene.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Image Upload */}
                      <div>
                        <Label className="text-sm font-medium mb-2 flex items-center gap-2"><ImageIcon className="w-4 h-4" />Imagem</Label>
                        <div className="space-y-3">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                            <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                            <p className="text-xs text-gray-600 mb-2">Clique para selecionar uma imagem</p>
                            <Input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(scene.id, file); }} className="hidden" id={`image-${scene.id}`} />
                            <Button variant="outline" size="sm" onClick={() => document.getElementById(`image-${scene.id}`)?.click()} className="bg-white hover:bg-gray-50">Selecionar Imagem</Button>
                          </div>
                          {scene.imagePreview && <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden"><img src={scene.imagePreview} alt="Preview" className="w-full h-full object-cover" /></div>}
                        </div>
                      </div>

                      {/* Narration Upload */}
                      <div>
                        <Label className="text-sm font-medium mb-2 flex items-center gap-2"><Music className="w-4 h-4" />Narração (por cena)</Label>
                        <div className="space-y-3">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                            <Music className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                            <p className="text-xs text-gray-600 mb-2">Clique para selecionar um áudio</p>
                            <Input type="file" accept="audio/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleNarrationUpload(scene.id, file); }} className="hidden" id={`audio-${scene.id}`} />
                            <Button variant="outline" size="sm" onClick={() => document.getElementById(`audio-${scene.id}`)?.click()} className="bg-white hover:bg-gray-50">Selecionar Áudio</Button>
                          </div>
                          {scene.audio && <div className="bg-gray-100 rounded-lg p-3"><div className="flex items-center gap-2 text-sm text-gray-700"><Music className="w-4 h-4" />{scene.audio.name}</div></div>}
                        </div>
                      </div>
                    </div>
                    
                    {/* Visual Effects */}
                    <div className="border-t border-gray-200 pt-6">
                      <Label className="text-sm font-medium mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4" />Efeitos Visuais</Label>
                      <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg"><div className="flex items-center justify-between mb-4"><Label className="text-sm font-medium flex items-center gap-2"><ZoomIn className="w-4 h-4" />Efeito Zoom</Label><Switch checked={scene.zoomEnabled} onCheckedChange={(checked) => updateScene(scene.id, { zoomEnabled: checked })} /></div>{scene.zoomEnabled && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><Label className="text-xs text-gray-600 mb-2">Intensidade ({scene.zoomIntensity}%)</Label><Slider value={[scene.zoomIntensity]} onValueChange={(value) => updateScene(scene.id, { zoomIntensity: value[0] })} max={50} min={10} step={5} className="w-full" /></div><div><Label className="text-xs text-gray-600 mb-1">Direção</Label><Select value={scene.zoomDirection} onValueChange={(value: 'in' | 'out') => updateScene(scene.id, { zoomDirection: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="in">Zoom In</SelectItem><SelectItem value="out">Zoom Out</SelectItem></SelectContent></Select></div></div>)}</div>
                        <div className="bg-gray-50 p-4 rounded-lg"><Label className="text-sm font-medium mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4" />Transições Fade</Label><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><Label className="text-xs text-gray-600 mb-2">Fade In ({scene.fadeInDuration}s)</Label><Slider value={[scene.fadeInDuration]} onValueChange={(value) => updateScene(scene.id, { fadeInDuration: value[0] })} max={3} min={0} step={0.1} className="w-full" /></div><div><Label className="text-xs text-gray-600 mb-2">Fade Out ({scene.fadeOutDuration}s)</Label><Slider value={[scene.fadeOutDuration]} onValueChange={(value) => updateScene(scene.id, { fadeOutDuration: value[0] })} max={3} min={0} step={0.1} className="w-full" /></div></div></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1 space-y-8">
            {/* Global Settings */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 sticky top-24">
              <CardHeader><CardTitle className="text-lg text-gray-900 flex items-center gap-2"><Globe className="w-5 h-5" />Configurações Gerais</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {/* Background Music */}
                <div>
                  <Label className="text-sm font-medium mb-2 flex items-center gap-2"><Music className="w-4 h-4" />Trilha Sonora (Fundo)</Label>
                  <Input type="file" accept="audio/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleBackgroundMusicUpload(file); }} className="hidden" id="bg-music-upload" />
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('bg-music-upload')?.click()} className="w-full bg-white hover:bg-gray-50">Selecionar Música</Button>
                  {backgroundMusic && <div className="bg-gray-100 rounded-lg p-3 mt-2"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm text-gray-700 truncate"><Music className="w-4 h-4 flex-shrink-0" /><span className="truncate">{backgroundMusic.name}</span></div><Button variant="ghost" size="sm" onClick={() => setBackgroundMusic(null)} className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-3 h-3" /></Button></div></div>}
                </div>
                
                {/* Global SRT */}
                <div className="border-t pt-6">
                  <Label className="text-sm font-medium mb-2 flex items-center gap-2"><FileVideo className="w-4 h-4" />Legenda Global (SRT)</Label>
                  <Input type="file" accept=".srt,text/plain" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleSrtUpload(file); }} className="hidden" id="srt-upload" />
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('srt-upload')?.click()} className="w-full bg-white hover:bg-gray-50">Selecionar Arquivo SRT</Button>
                  {globalSrtFile && <div className="bg-gray-100 rounded-lg p-3 mt-2"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm text-gray-700 truncate"><FileVideo className="w-4 h-4 flex-shrink-0" /><span className="truncate">{globalSrtFile.name}</span></div><Button variant="ghost" size="sm" onClick={() => setGlobalSrtFile(null)} className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-3 h-3" /></Button></div></div>}
                </div>

                {/* Subtitle Styling */}
                {globalSrtFile && (
                  <div className="border-t pt-6 space-y-4">
                    <Label className="text-sm font-medium flex items-center gap-2"><Palette className="w-4 h-4" />Estilo da Legenda</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label className="text-xs text-gray-600 mb-1">Fonte</Label><Select value={fontFamily} onValueChange={setFontFamily}><SelectTrigger className="bg-white border-gray-300"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Arial">Arial</SelectItem><SelectItem value="Helvetica">Helvetica</SelectItem><SelectItem value="Times New Roman">Times New Roman</SelectItem><SelectItem value="Courier New">Courier New</SelectItem><SelectItem value="Verdana">Verdana</SelectItem><SelectItem value="Georgia">Georgia</SelectItem><SelectItem value="Impact">Impact</SelectItem><SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem></SelectContent></Select></div>
                      <div><Label className="text-xs text-gray-600 mb-1">Tamanho</Label><Input type="number" min="12" max="72" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="bg-white border-gray-300" /></div>
                      <div><Label className="text-xs text-gray-600 mb-1">Cor</Label><Input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="bg-white border-gray-300" /></div>
                      <div><Label className="text-xs text-gray-600 mb-1">Sombra</Label><Input type="color" value={shadowColor} onChange={(e) => setShadowColor(e.target.value)} className="bg-white border-gray-300" /></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Render Panel */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 sticky top-[calc(24px+var(--card-height,600px))]">
              <CardHeader><CardTitle className="text-lg text-gray-900 flex items-center gap-2"><Video className="w-5 h-5" />Renderização</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {isProcessing && <div className="space-y-3"><div className="flex items-center justify-between text-sm"><span className="text-gray-600">Progresso</span><span className="text-gray-900 font-medium">{Math.round(progress)}%</span></div><Progress value={progress} className="h-2" /><div className="flex items-center gap-2 text-sm text-gray-600"><Clock className="w-4 h-4 animate-spin" />Processando...</div></div>}
                {videoUrl && <div className="space-y-3"><div className="aspect-video bg-gray-100 rounded-lg overflow-hidden"><video src={videoUrl} controls className="w-full h-full object-cover" /></div><Button onClick={downloadVideo} className="w-full bg-green-600 hover:bg-green-700 text-white"><Download className="w-4 h-4 mr-2" />Baixar Vídeo</Button></div>}
                {debugLogs.length > 0 && <div className="space-y-3"><div className="flex items-center justify-between"><Label className="text-sm font-medium text-gray-700">Logs de Debug</Label><Button variant="ghost" size="sm" onClick={clearDebugLogs} className="text-gray-600 hover:text-gray-800">Limpar</Button></div><ScrollArea className="h-40 w-full rounded-md border border-gray-200 bg-gray-50 p-3"><div className="space-y-1">{debugLogs.map((log, index) => (<div key={index} className="text-xs font-mono text-gray-700">{log}</div>))}</div></ScrollArea></div>}
              </CardContent>
            </Card>
          </div>
        </div>

        {scenes.length > 0 && <div className="text-center pt-8"><Button onClick={addNewScene} className="bg-blue-600 hover:bg-blue-700 text-white"><Plus className="w-4 h-4 mr-2" />Adicionar Nova Cena</Button></div>}
      </div>
    </div>
  );
};

export default Editor;