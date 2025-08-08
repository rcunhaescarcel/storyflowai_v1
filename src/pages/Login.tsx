import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Wand2 } from 'lucide-react';

const Login = () => {
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/editor');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Wand2 className="h-10 w-10 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Bem-vindo de volta!</h1>
          <p className="text-muted-foreground">Faça login para continuar criando vídeos mágicos.</p>
        </div>
        <div className="bg-background p-8 rounded-2xl shadow-lg border">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            theme="light"
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Seu email',
                  password_label: 'Sua senha',
                  button_label: 'Entrar',
                  social_provider_text: 'Entrar com {{provider}}',
                  link_text: 'Já tem uma conta? Entre aqui',
                },
                sign_up: {
                  email_label: 'Seu email',
                  password_label: 'Crie uma senha',
                  button_label: 'Criar conta',
                  social_provider_text: 'Criar conta com {{provider}}',
                  link_text: 'Não tem uma conta? Crie uma aqui',
                },
                forgotten_password: {
                  email_label: 'Seu email',
                  button_label: 'Enviar instruções',
                  link_text: 'Esqueceu sua senha?',
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;