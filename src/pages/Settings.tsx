import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useSession } from '@/contexts/SessionContext';
import { supabase } from '@/integrations/supabase/client';
import { Crown, KeyRound, Palette, Save, User, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { session } = useSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error("E-mail não encontrado para redefinir a senha.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      toast.error("Falha ao enviar e-mail", { description: error.message });
    } else {
      toast.success("E-mail de redefinição de senha enviado!", {
        description: "Verifique sua caixa de entrada para continuar.",
      });
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair", { description: error.message });
    } else {
      toast.success("Você saiu com sucesso!");
      navigate('/login');
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulação de salvamento, pois não há backend para persistir ainda.
    setTimeout(() => {
      toast.success("Configurações salvas com sucesso!");
      setIsSaving(false);
    }, 1000);
  };

  return (
    <main className="container max-w-screen-lg mx-auto px-4 py-8">
      <div className="text-center mt-8 mb-12">
        <h1 className="text-4xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Personalize sua experiência no Viflow IA.
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
              <Select defaultValue="pt-br" disabled>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-br">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Voz preferida</Label>
              <Select defaultValue="nova">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="alloy">Alloy</SelectItem>
                  <SelectItem value="echo">Echo</SelectItem>
                  <SelectItem value="fable">Fable</SelectItem>
                  <SelectItem value="onyx">Onyx</SelectItem>
                  <SelectItem value="nova">Nova (Mentor)</SelectItem>
                  <SelectItem value="shimmer">Shimmer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estilo visual padrão</Label>
              <Select defaultValue="motivacional" disabled>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="motivacional">Motivacional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duração padrão</Label>
              <Select defaultValue="60">
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
              <ToggleGroup type="single" value={theme} onValueChange={(value) => value && setTheme(value)} className="justify-start">
                <ToggleGroupItem value="light">Claro</ToggleGroupItem>
                <ToggleGroupItem value="dark">Escuro</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Button variant="outline" onClick={handlePasswordReset}>
                <KeyRound className="w-4 h-4 mr-2" />
                Alterar Senha
              </Button>
              <p className="text-sm text-muted-foreground">
                Você receberá um e-mail com as instruções para criar uma nova senha.
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

        {/* Plano e Faturamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Crown className="w-6 h-6 text-primary" />
              Plano e Faturamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold">Plano Gratuito</h3>
              <p className="text-muted-foreground text-sm mt-1">3 vídeos por mês • Qualidade HD</p>
              <div className="mt-4 space-y-2">
                <Progress value={(1 / 3) * 100} className="h-2" />
                <p className="text-sm text-muted-foreground">Você já criou 1 de 3 vídeos este mês.</p>
              </div>
              <Button className="mt-6" onClick={() => toast.info("Funcionalidade em breve!", { description: "A opção de upgrade estará disponível em breve." })}>
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Settings;