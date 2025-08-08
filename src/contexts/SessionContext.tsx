import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type Profile = Tables<'profiles'> & {
  default_voice?: string | null;
  default_style?: string | null;
  default_duration?: number | null;
  default_language?: string | null;
};

interface SessionContextType {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getProfile = async (user: User): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        throw error;
      }

      if (data) {
        return data;
      }

      if (error && error.code === 'PGRST116') {
        console.warn("No profile found for user, creating one now.");
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: user.id })
          .select()
          .single();

        if (insertError) {
          throw new Error(`Failed to create profile: ${insertError.message}`);
        }
        
        toast.info("Seu perfil foi criado com 100 coins de bônus!");
        return newProfile;
      }

      return null;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      console.error("Error fetching or creating profile:", message);
      toast.error("Erro ao carregar seu perfil.", { description: message });
      return null;
    }
  };

  useEffect(() => {
    setIsLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const userProfile = await getProfile(session.user);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      // A lógica de carregamento foi simplificada.
      // Agora, qualquer evento de autenticação inicial irá parar o spinner,
      // tornando o carregamento mais robusto em diferentes cenários de sessão.
      setIsLoading(false);
    });

    // Fallback para garantir que o carregamento pare mesmo se nenhum evento for disparado.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, profile, isLoading, setProfile }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};