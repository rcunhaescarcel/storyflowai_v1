import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useSession, Profile } from '@/contexts/SessionContext';
import { supabase } from '@/integrations/supabase/client';
import { Crown, KeyRound, Palette, Save, User, LogOut, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { startOfMonth, endOfMonth } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { storyStyles, openAIVoices, languages } from '@/lib/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { PasswordChangeModal } from '@/components/settings/PasswordChangeModal';

const fetchMonthlyVideoCount = async (userId: string): Promise<number> => {
  const now = new Date();
  const startDate = startOfMonth(now).toISOString();
  const endDate = endOfMonth(now).toISOString();

  const { count, error } = await supabase
    .from('video_projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (error) {
    console.error("Error fetching monthly video count:", error);
    throw new Error(error.message);
  }

  return count ?? 0;
};

const Settings = () => {
  const { session, profile, setProfile } = useSession();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [preferredLanguage, setPreferredLanguage] = useState('pt-br');
  const [preferredVoice, setPreferredVoice] = useState('nova');
  const [preferredStyle, setPreferredStyle] = useState('pixar');
  const [preferredDuration, setPreferredDuration] = useState('60');

  const { data: monthlyVideoCount, isLoading: isLoadingCount } = useQuery({
    queryKey: ['monthlyVideoCount', session?.user?.id],
    queryFn: () => fetchMonthlyVideoCount(session!.user.id),
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
    if (profile) {
      setPreferredLanguage(profile.default_language || 'pt-br');
      setPreferredVoice(profile.default_voice || 'nova');
      setPreferredDuration(String(profile.default_duration || '60'));
      setPreferredStyle(profile.default_style || 'pixar');
    }
  }, [session, profile]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair", { description: error.message });
    } else {
      toast.success("Você saiu com sucesso!");
      navigate('/login');
    }
  };

  const handleSave = async () => {
    if (!session?.user) {
      toast.error("Você precisa estar logado para salvar as configurações.");
      return;
    }
    setIsSaving(true);

    const updates = {
      default_language: preferredLanguage,
      default_voice: preferredVoice,
      default_style: preferredStyle,
      default_duration: parseInt(preferredDuration, 10),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id)
      .select()
      .single();

    setIsSaving(false);
    if (error) {
      toast.error("Falha ao salvar configurações", { description: error.message });
    } else {
      toast.success("Configurações salvas com sucesso!");
      if (data) {
        setProfile(data as Profile);
      }
    }
  };

  const freePlanLimit = 3;
  const videosCreated = monthlyVideoCount ?? 0;
  const progressValue = (videosCreated / freePlanLimit) * 100;
  const coinsPerVideo = 3;
  const estimatedVideosWithCoins = Math.floor((profile?.coins ?? 0) / coinsPerVideo);

  return (
    <>
      <main className="container max-w-screen-lg mx-auto px-4 py-8">
        <div className="text-center mt-8 mb-12">
          <h1 className="text-4xl font-bold">
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text">
              Configurações
            </span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Personalize sua experiência no StoryFlow.
          </p>
        </div>

        <div className="space-y-8">
          {/* Preferências Padrão */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Palette className="w-6 h-6 text-primary" />
                Preferências Padrão
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Idioma padrão da conta</Label>
                <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(languages).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Voz preferida</Label>
                <Select value={preferredVoice} onValueChange={setPreferredVoice}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {openAIVoices.map(voice => (
                      <SelectItem key={voice} value={voice} className="capitalize">{voice}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estilo visual padrão</Label>
                <Select value={preferredStyle} onValueChange={setPreferredStyle}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(storyStyles).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duração padrão</Label>
                <Select value={preferredDuration} onValueChange={setPreferredDuration}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 segundos</SelectItem>
                    <SelectItem value="60">1 minuto</SelectItem>
                    <SelectItem value="90">1 minuto e 30s</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Plano e Faturamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Crown className="w-6 h-6 text-primary" />
                Plano e Faturamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold">Plano Gratuito</h3>
                <p className="text-muted-foreground text-sm mt-1">{freePlanLimit} vídeos por mês • Qualidade HD</p>
                <div className="mt-4 space-y-2">
                  {isLoadingCount ? (
                    <>
                      <Skeleton className="h-2 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </>
                  ) : (
                    <>
                      <Progress value={progressValue} className="h-2" />
                      <p className="text-sm text-muted-foreground">
                        Você já criou {videosCreated} de {freePlanLimit} vídeos este mês.
                      </p>
                    </>
                  )}
                </div>
                <Button className="mt-6" onClick={() => toast.info("Funcionalidade em breve!", { description: "A opção de upgrade estará disponível em breve." })}>
                  Upgrade
                </Button>
              </div>
              <div className="bg-yellow-400/10 border border-yellow-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-600" />
                  Seu Saldo de Coins
                </h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-bold">{profile?.coins ?? 0}</span>
                  <span className="text-muted-foreground">coins</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Com seu saldo atual, você pode criar aproximadamente mais {estimatedVideosWithCoins} vídeos.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informações da Conta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <User className="w-6 h-6 text-primary" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} disabled />
              </div>
              <div className="space-y-2">
                <Label>Tema</Label>
                <p className="text-sm text-muted-foreground">Escolha entre modo claro ou escuro.</p>
                <ToggleGroup type="single" value={theme} onValueChange={(value) => value && setTheme(value as 'light' | 'dark' | 'system')} className="justify-start">
                  <ToggleGroupItem value="light">Claro</ToggleGroupItem>
                  <ToggleGroupItem value="dark">Escuro</ToggleGroupItem>
                  <ToggleGroupItem value="system">Sistema</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Button variant="outline" onClick={() => setIsPasswordModalOpen(true)}>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Alterar Senha
                </Button>
                <p className="text-sm text-muted-foreground">
                  Altere sua senha de acesso à plataforma.
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/30 px-6 py-4">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair da Conta
              </Button>
            </CardFooter>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </div>
      </main>
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

export default Settings;