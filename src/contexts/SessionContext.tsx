import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type Profile = Tables<'profiles'>;

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

  useEffect(() => {
    const setupSessionAndProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session?.user) {
          // Attempt to fetch the profile
          let { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          // If the profile doesn't exist (specific error code for 0 rows), create it.
          // This handles existing users who signed up before the profiles table was created.
          if (profileError && profileError.code === 'PGRST116') {
            console.warn("No profile found for user, creating one now.");
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({ id: session.user.id })
              .select()
              .single();
            
            if (insertError) {
              throw new Error(`Failed to create profile: ${insertError.message}`);
            }
            profileData = newProfile;
            toast.info("Perfil de usuário criado com 100 coins iniciais!");
          } else if (profileError) {
            // For any other error, throw it
            throw profileError;
          }
          
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error setting up session and profile:", error);
        toast.error("Erro ao carregar os dados do seu perfil.");
      } finally {
        setIsLoading(false);
      }
    };

    setupSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
      } else {
        setProfile(null);
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