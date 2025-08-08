import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wand2, Video, Settings, LogOut } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AppHeader = () => {
  const { session } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair:", error.message);
    } else {
      toast.success("Você saiu com sucesso!");
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-4 z-50 w-full">
      <div className="container flex items-center justify-between">
        <div />
        <nav className="flex items-center gap-1 p-2 rounded-full bg-background/80 border shadow-lg backdrop-blur-sm">
          <NavLink to="/editor">
            {({ isActive }) => (
              <Button variant={isActive ? "default" : "ghost"} size="sm" className="gap-2 rounded-full px-4">
                <Wand2 className="w-4 h-4" />
                Criar
              </Button>
            )}
          </NavLink>
          <NavLink to="/videos">
            {({ isActive }) => (
              <Button variant={isActive ? "secondary" : "ghost"} size="sm" className="gap-2 rounded-full px-4">
                <Video className="w-4 h-4" />
                Vídeos
              </Button>
            )}
          </NavLink>
          <NavLink to="/settings">
            {({ isActive }) => (
              <Button variant={isActive ? "secondary" : "ghost"} size="sm" className="gap-2 rounded-full px-4">
                <Settings className="w-4 h-4" />
                Ajustes
              </Button>
            )}
          </NavLink>
        </nav>
        <div>
          {session && (
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 rounded-full px-4">
              Sair
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;