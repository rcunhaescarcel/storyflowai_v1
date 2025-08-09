import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSession, Profile } from '@/contexts/SessionContext';
import { supabase } from '@/integrations/supabase/client';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useTheme } from '@/contexts/ThemeContext';
import { PasswordChangeModal } from '@/components/settings/PasswordChangeModal';
import { DefaultPreferencesCard } from '@/components/settings/DefaultPreferencesCard';
import { PlanAndBillingCard } from '@/components/settings/PlanAndBillingCard';
import { AccountInfoCard } from '@/components/settings/AccountInfoCard';

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

  const handleThemeChange = (newTheme: string) => {
    if (newTheme === 'light' || newTheme === 'dark' || newTheme === 'system') {
      setTheme(newTheme);
    }
  };

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
          <DefaultPreferencesCard
            preferredLanguage={preferredLanguage}
            setPreferredLanguage={setPreferredLanguage}
            preferredVoice={preferredVoice}
            setPreferredVoice={setPreferredVoice}
            preferredStyle={preferredStyle}
            setPreferredStyle={setPreferredStyle}
            preferredDuration={preferredDuration}
            setPreferredDuration={setPreferredDuration}
          />

          <PlanAndBillingCard
            profile={profile}
            monthlyVideoCount={monthlyVideoCount}
            isLoadingCount={isLoadingCount}
          />

          <AccountInfoCard
            email={email}
            theme={theme}
            onThemeChange={handleThemeChange}
            onPasswordChangeClick={() => setIsPasswordModalOpen(true)}
            onLogout={handleLogout}
          />

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