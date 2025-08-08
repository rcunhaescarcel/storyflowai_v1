import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wand2, Video, Settings, Coins } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";

interface AppHeaderProps {
  onBuyCoinsClick: () => void;
}

const AppHeader = ({ onBuyCoinsClick }: AppHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useSession();

  const isEditingProject = location.pathname === '/editor' && !!location.state?.project;
  const isCreating = location.pathname === '/editor' && !isEditingProject;

  const handleCreateClick = () => {
    navigate('/editor', { state: null, replace: location.pathname === '/editor' });
  };

  return (
    <header className="sticky top-4 z-50 w-full">
      <div className="container flex items-center justify-center">
        <nav className="flex items-center gap-1 p-2 rounded-full bg-background/80 border shadow-lg backdrop-blur-sm">
          <Button
            variant={isCreating ? "default" : "ghost"}
            size="sm"
            className="gap-2 rounded-full px-4"
            onClick={handleCreateClick}
          >
            <Wand2 className="w-4 h-4" />
            Criar
          </Button>
          <NavLink to="/videos">
            {({ isActive }) => (
              <Button variant={isActive || isEditingProject ? "default" : "ghost"} size="sm" className="gap-2 rounded-full px-4">
                <Video className="w-4 h-4" />
                Vídeos
              </Button>
            )}
          </NavLink>
          <NavLink to="/settings">
            {({ isActive }) => (
              <Button variant={isActive ? "default" : "ghost"} size="sm" className="gap-2 rounded-full px-4">
                <Settings className="w-4 h-4" />
                Ajustes
              </Button>
            )}
          </NavLink>
          {profile && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 rounded-full px-4" 
              onClick={onBuyCoinsClick}
            >
              <Coins className="w-4 h-4" />
              {profile.coins ?? 0} Coins
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;