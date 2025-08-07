import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Trash2, 
  Video, 
  ArrowLeft,
  Music,
  FileVideo,
  Clock,
  Download,
  Globe,
  Palette,
  Volume2,
  Film,
  Image as ImageIcon,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  UserSquare,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Scene, useFFmpeg, SubtitleStyle, LogoPosition } from "@/hooks/useFFmpeg";
import { ImageUploader } from "@/components/editor/ImageUploader";
import { AudioUploader } from "@/components/editor/AudioUploader";
import { EffectsPopover } from "@/components/editor/EffectsPopover";
import { NarrationGenerator } from "@/components/editor/NarrationGenerator";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { resizeImage } from "@/lib/imageUtils";
import { ViewImageModal } from "@/components/editor/ViewImageModal";

type VideoQuality = 'hd' | 'fullhd';

const Editor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [globalSrtFile, setGlobalSrtFile] = useState<File | null>(null);
  const [backgroundMusic, setBackgroundMusic] = useState<File | null>(null);
  const [backgroundMusicVolume, setBackgroundMusicVolume] = useState(0.5);
  const [videoQuality, setVideoQuality] = useState<VideoQuality>('fullhd');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>('top-right');
  const [characterImage, setCharacterImage] = useState<File | null>(null);
  const [characterImagePreview, setCharacterImagePreview] = useState<string | null>(null);
  
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState("#ffffff");
  const [shadowColor, setShadowColor] = useState("#000000");

  const { 
    renderVideo, 
    isProcessing, 
    progress, 
    debugLogs, 
    clearDebugLogs,
    addDebugLog
  } = useFFmpeg();
  
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const addNewScene = () => {
    const newScene: Scene = {
      id: crypto.randomUUID(),
      effect: "fade",
      zoomEnabled: false,
      zoomIntensity: 20,
      zoomDirection: "in",
      fadeInDuration: 0.5,
      fadeOutDuration: 0.5,
      narrationText: ""
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

  const moveSceneUp = (index: number) => {
    if (index === 0) return;
    const newScenes = [...scenes];
    [newScenes[index - 1], newScenes[index]] = [newScenes[index], newScenes[index - 1]];
    setScenes(newScenes);
  };

  const moveSceneDown = (index: number) => {
    if (index === scenes.length - 1) return;
    const newScenes = [...scenes];
    [newScenes[index + 1], newScenes[index]] = [newScenes[index], newScenes[index + 1]];
    setScenes(newScenes);
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast({
        title: "Logotipo Carregado",
        description: "O logotipo será adicionado ao vídeo.",
      });
    }
  };

  const handleCharacterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const resizedImagePreview = await resizeImage(file, 1024, 1024);
        setCharacterImage(file);
        setCharacterImagePreview(resizedImagePreview);
        toast({
          title: "Personagem de Referência Carregado",
          description: "A imagem foi otimizada e está pronta para ser usada.",
        });
      } catch (error) {
        toast({
          title: "Erro ao processar imagem",
          description: "Não foi possível redimensionar a imagem.",
          variant: "destructive",
        });
      }
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
      const result = await renderVideo(scenes, globalSrtFile, backgroundMusic, subtitleStyle, backgroundMusicVolume, videoQuality, logoFile, logoPosition);
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
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-bold text-foreground">Editor de Vídeo</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              {scenes.length} cena{scenes.length !== 1 ? 's' : ''}
            </Badge>
            <Button onClick={handleRenderVideo} disabled={scenes.length === 0 || isProcessing}>
              {isProcessing ? <><Clock className="w-4 h-4 mr-2 animate-spin" />Renderizando...</> : <><Video className="w-4 h-4 mr-2" />Renderizar Vídeo</>}
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-screen-xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {scenes.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed rounded-lg">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Video className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Crie Sua Primeira Cena</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">Adicione imagens e narrações para começar a criar seu vídeo.</p>
                <Button onClick={addNewScene}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Nova Cena
                </Button>
              </div>
            )}

            <div className="space-y-6">
              {scenes.map((scene, index) => (
                <Card key={scene.id} className="bg-background">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-3">
                        <Badge variant="outline" className="px-2.5 py-1 text-sm">{index + 1}</Badge>
                        Cena
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => moveSceneUp(index)} disabled={index === 0}>
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => moveSceneDown(index)} disabled={index === scenes.length - 1}>
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteScene(scene.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                      <div className="md:col-span-3 space-y-4">
                        <NarrationGenerator
                          narrationText={scene.narrationText}
                          onTextChange={(text) => updateScene(scene.id, { narrationText: text })}
                          onAudioGenerated={(file) => handleNarrationUpload(scene.id, file)}
                        />
                        <div className="border-t pt-4 space-y-4">
                          <AudioUploader
                            sceneId={scene.id}
                            audio={scene.audio}
                            onAudioUpload={(file) => handleNarrationUpload(scene.id, file)}
                            onAudioRemove={() => updateScene(scene.id, { audio: undefined })}
                          />
                          <EffectsPopover
                            scene={scene}
                            onUpdate={(updates) => updateScene(scene.id, updates)}
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <ImageUploader
                          sceneId={scene.id}
                          imagePreview={scene.imagePreview}
                          onImageUpload={(file) => handleImageUpload(scene.id, file)}
                          onImageRemove={() => updateScene(scene.id, { image: undefined, imagePreview: undefined })}
                          onViewImage={() => setViewingImage(scene.imagePreview || null)}
                          characterImage={characterImage}
                          characterImagePreview={characterImagePreview}
                          addDebugLog={addDebugLog}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {scenes.length > 0 && <div className="text-center pt-8"><Button onClick={addNewScene}><Plus className="w-4 h-4 mr-2" />Adicionar Nova Cena</Button></div>}
          </div>

          {/* Side Panel */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-8">
              <Card className="bg-background">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Globe className="w-5 h-5" />Configurações Gerais</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2"><Film className="w-4 h-4" />Qualidade do Vídeo</Label>
                    <Select value={videoQuality} onValueChange={(value: VideoQuality) => setVideoQuality(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fullhd">Full HD (1080p)</SelectItem>
                        <SelectItem value="hd">HD (720p)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t pt-6">
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2"><UserSquare className="w-4 h-4" />Personagem (Contexto)</Label>
                    <Input type="file" accept="image/png, image/jpeg" onChange={handleCharacterImageUpload} className="hidden" id="character-upload" />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('character-upload')?.click()} className="w-full">Selecionar Imagem</Button>
                    {characterImage && (
                      <div className="bg-muted/50 rounded-lg p-3 mt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-foreground truncate">
                            {characterImagePreview && <img src={characterImagePreview} alt="character preview" className="w-10 h-10 object-contain rounded" />}
                            <span className="truncate">{characterImage.name}</span>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => { setCharacterImage(null); setCharacterImagePreview(null); }} className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-6">
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2"><Music className="w-4 h-4" />Trilha Sonora (Fundo)</Label>
                    <Input type="file" accept="audio/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleBackgroundMusicUpload(file); }} className="hidden" id="bg-music-upload" />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('bg-music-upload')?.click()} className="w-full">Selecionar Música</Button>
                    {backgroundMusic && (
                      <div className="bg-muted/50 rounded-lg p-3 mt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-foreground truncate">
                            <Music className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{backgroundMusic.name}</span>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => setBackgroundMusic(null)} className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="mt-4">
                          <Label className="text-xs text-muted-foreground flex items-center gap-1.5"><Volume2 className="w-3.5 h-3.5" />Volume ({Math.round(backgroundMusicVolume * 100)}%)</Label>
                          <Slider
                            value={[backgroundMusicVolume]}
                            onValueChange={(value) => setBackgroundMusicVolume(value[0])}
                            max={1}
                            min={0}
                            step={0.05}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-6">
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2"><ImageIcon className="w-4 h-4" />Logotipo</Label>
                    <Input type="file" accept="image/png, image/jpeg" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('logo-upload')?.click()} className="w-full">Selecionar Logotipo</Button>
                    {logoFile && (
                      <div className="bg-muted/50 rounded-lg p-3 mt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-foreground truncate">
                            {logoPreview && <img src={logoPreview} alt="logo preview" className="w-8 h-8 object-contain rounded" />}
                            <span className="truncate">{logoFile.name}</span>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => { setLogoFile(null); setLogoPreview(null); }} className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="mt-4">
                          <Label className="text-xs text-muted-foreground">Posição do Logotipo</Label>
                          <ToggleGroup type="single" value={logoPosition} onValueChange={(value) => { if (value) setLogoPosition(value as LogoPosition); }} className="grid grid-cols-4 gap-2 mt-2">
                            <ToggleGroupItem value="top-left" aria-label="Topo Esquerdo"><CornerUpLeft className="h-4 w-4" /></ToggleGroupItem>
                            <ToggleGroupItem value="top-right" aria-label="Topo Direito"><CornerUpRight className="h-4 w-4" /></ToggleGroupItem>
                            <ToggleGroupItem value="bottom-left" aria-label="Inferior Esquerdo"><CornerDownLeft className="h-4 w-4" /></ToggleGroupItem>
                            <ToggleGroupItem value="bottom-right" aria-label="Inferior Direito"><CornerDownRight className="h-4 w-4" /></ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-6">
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2"><FileVideo className="w-4 h-4" />Legenda Global (SRT)</Label>
                    <Input type="file" accept=".srt,text/plain" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleSrtUpload(file); }} className="hidden" id="srt-upload" />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('srt-upload')?.click()} className="w-full">Selecionar Arquivo SRT</Button>
                    {globalSrtFile && <div className="bg-muted/50 rounded-lg p-3 mt-2 flex items-center justify-between"><div className="flex items-center gap-2 text-sm text-foreground truncate"><FileVideo className="w-4 h-4 flex-shrink-0" /><span className="truncate">{globalSrtFile.name}</span></div><Button variant="ghost" size="icon" onClick={() => setGlobalSrtFile(null)} className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button></div>}
                  </div>

                  {globalSrtFile && (
                    <div className="border-t pt-6 space-y-4">
                      <Label className="text-sm font-medium flex items-center gap-2"><Palette className="w-4 h-4" />Estilo da Legenda</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label className="text-xs text-muted-foreground mb-1">Fonte</Label><Select value={fontFamily} onValueChange={setFontFamily}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Arial">Arial</SelectItem><SelectItem value="Helvetica">Helvetica</SelectItem><SelectItem value="Times New Roman">Times New Roman</SelectItem><SelectItem value="Courier New">Courier New</SelectItem><SelectItem value="Verdana">Verdana</SelectItem><SelectItem value="Georgia">Georgia</SelectItem><SelectItem value="Impact">Impact</SelectItem><SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem></SelectContent></Select></div>
                        <div><Label className="text-xs text-muted-foreground mb-1">Tamanho</Label><Input type="number" min="12" max="72" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} /></div>
                        <div><Label className="text-xs text-muted-foreground mb-1">Cor</Label><Input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="p-1"/></div>
                        <div><Label className="text-xs text-muted-foreground mb-1">Sombra</Label><Input type="color" value={shadowColor} onChange={(e) => setShadowColor(e.target.value)} className="p-1"/></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-background">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Video className="w-5 h-5" />Renderização</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {isProcessing && <div className="space-y-3"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Progresso</span><span className="text-foreground font-medium">{Math.round(progress)}%</span></div><Progress value={progress} className="h-2" /><div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="w-4 h-4 animate-spin" />Processando...</div></div>}
                  {videoUrl && <div className="space-y-3"><div className="aspect-video bg-muted rounded-lg overflow-hidden"><video src={videoUrl} controls className="w-full h-full object-cover" /></div><Button onClick={downloadVideo} className="w-full bg-green-600 hover:bg-green-700 text-white"><Download className="w-4 h-4 mr-2" />Baixar Vídeo</Button></div>}
                  {debugLogs.length > 0 && <div className="space-y-3"><div className="flex items-center justify-between"><Label className="text-sm font-medium">Logs de Debug</Label><Button variant="ghost" size="sm" onClick={clearDebugLogs}>Limpar</Button></div><ScrollArea className="h-40 w-full rounded-md border bg-muted/50 p-3"><div className="space-y-1">{debugLogs.map((log, index) => (<div key={index} className="text-xs font-mono text-muted-foreground">{log}</div>))}</div></ScrollArea></div>}
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </main>

      <ViewImageModal
        isOpen={!!viewingImage}
        onClose={() => setViewingImage(null)}
        imageUrl={viewingImage}
      />
    </div>
  );
};

export default Editor;