import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Clock, Mic, UserSquare, Trash2, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { Scene } from '@/hooks/useFFmpeg';
import { Progress } from '@/components/ui/progress';
import { useSession } from '@/contexts/SessionContext';
import { storyStyles, openAIVoices, languages } from '@/lib/constants';
import { CharacterModal } from './CharacterModal';
import { useStoryGenerator } from '@/hooks/useStoryGenerator';

interface StoryPromptFormProps {
  onStoryGenerated: (scenes: Scene[], characterFile?: File, characterPreview?: string, prompt?: string, style?: string) => void;
  addDebugLog: (message: string) => void;
}

export const StoryPromptForm = ({ onStoryGenerated, addDebugLog }: StoryPromptFormProps) => {
  const { profile, isLoading: isSessionLoading } = useSession();
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState('30');
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [selectedStyle, setSelectedStyle] = useState('pixar');
  const [characterImage, setCharacterImage] = useState<File | null>(null);
  const [characterImagePreview, setCharacterImagePreview] = useState<string | null>(null);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);

  const { generateStory, isLoading, loadingMessage, progress } = useStoryGenerator({
    onStoryGenerated,
    addDebugLog,
  });

  useEffect(() => {
    if (profile) {
      setDuration(String(profile.default_duration || '30'));
      setSelectedVoice(profile.default_voice || 'nova');
      setSelectedStyle(profile.default_style || 'pixar');
    }
  }, [profile]);

  const handleCharacterConfirm = (file: File, preview: string) => {
    setCharacterImage(file);
    setCharacterImagePreview(preview);
    toast.success("Personagem selecionado com sucesso!");
  };

  const handleGenerateStory = () => {
    generateStory({
      prompt,
      duration,
      selectedVoice,
      selectedStyle,
      characterImage,
      characterImagePreview,
    });
  };

  if (isLoading || isSessionLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <div className="w-full max-w-md text-center">
          <p className="text-lg font-medium text-foreground">{isLoading ? loadingMessage : 'Carregando sessão...'}</p>
          {isLoading && <Progress value={progress} className="w-full mt-4" />}
          {isLoading && <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% concluído</p>}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center h-full py-10">
        <Sparkles className="w-12 h-12 mb-4" stroke="url(#icon-gradient)" />
        <h1 className="text-3xl font-bold text-center mb-2">
          <span className="bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text">
            Digite seu tema
          </span>
          <span className="text-foreground"> e deixe a mágica acontecer</span>
        </h1>
        <p className="text-muted-foreground mb-8 text-center">A IA irá criar um roteiro, gerar imagens e narrações para montar seu vídeo.</p>
        
        <div className="w-full p-2 bg-background rounded-2xl shadow-lg border">
          <div className="flex items-start gap-4 p-2">
            {characterImagePreview && (
              <div className="relative w-20 h-28 flex-shrink-0 group bg-muted/50 rounded-lg">
                <img src={characterImagePreview} alt="Personagem" className="w-full h-full rounded-lg object-contain" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setCharacterImage(null);
                    setCharacterImagePreview(null);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
            <Textarea
              placeholder="Ex: A jornada de um pequeno robô que se perdeu na cidade e tenta encontrar o caminho de volta para casa..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full border-none focus-visible:ring-0 text-base resize-none p-2 bg-transparent self-center"
              disabled={isLoading || isSessionLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!isSessionLoading) handleGenerateStory();
                }
              }}
            />
          </div>

          <div className="flex items-center justify-between p-2 mt-2 border-t">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedVoice} onValueChange={setSelectedVoice} disabled={isLoading || isSessionLoading}>
                <SelectTrigger className="w-auto h-9 px-3 border-none bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0 gap-2">
                  <Mic className="w-4 h-4 flex-shrink-0" />
                  <SelectValue placeholder="Voz" />
                </SelectTrigger>
                <SelectContent>
                  {openAIVoices.map(voice => (
                    <SelectItem key={voice.value} value={voice.value}>{voice.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStyle} onValueChange={setSelectedStyle} disabled={isLoading || isSessionLoading}>
                <SelectTrigger className="w-auto h-9 px-3 border-none bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0 gap-2">
                  <Palette className="w-4 h-4 flex-shrink-0" />
                  <SelectValue placeholder="Estilo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(storyStyles).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={duration} onValueChange={setDuration} disabled={isLoading || isSessionLoading}>
                <SelectTrigger className="w-auto h-9 px-3 border-none bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0 gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <SelectValue placeholder="Duração" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30s</SelectItem>
                  <SelectItem value="60">1m</SelectItem>
                  <SelectItem value="90">1m 30s</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="ghost" size="sm" className="h-9 px-3 text-muted-foreground" onClick={() => setIsCharacterModalOpen(true)} disabled={isLoading || isSessionLoading}>
                <UserSquare className="w-4 h-4 mr-2" /> Personagem
              </Button>
            </div>
            <Button onClick={handleGenerateStory} disabled={!prompt.trim() || isLoading || isSessionLoading}>
              <Sparkles className="w-4 h-4 mr-2" />
              Criar História
            </Button>
          </div>
        </div>
      </div>
      <CharacterModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        onConfirm={handleCharacterConfirm}
      />
    </>
  );
};