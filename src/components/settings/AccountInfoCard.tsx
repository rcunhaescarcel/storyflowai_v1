import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { KeyRound, User, LogOut } from "lucide-react";

interface AccountInfoCardProps {
  email: string;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: string) => void;
  onPasswordChangeClick: () => void;
  onLogout: () => void;
}

export const AccountInfoCard = ({
  email,
  theme,
  onThemeChange,
  onPasswordChangeClick,
  onLogout,
}: AccountInfoCardProps) => {
  return (
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
          <ToggleGroup type="single" value={theme} onValueChange={onThemeChange} className="justify-start">
            <ToggleGroupItem value="light">Claro</ToggleGroupItem>
            <ToggleGroupItem value="dark">Escuro</ToggleGroupItem>
            <ToggleGroupItem value="system">Sistema</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Label>Senha</Label>
            <Button variant="outline" onClick={onPasswordChangeClick}>
              <KeyRound className="w-4 h-4 mr-2" />
              Alterar Senha
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Altere sua senha de acesso à plataforma.
          </p>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 px-6 py-4">
        <Button variant="outline" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Sair da Conta
        </Button>
      </CardFooter>
    </Card>
  );
};