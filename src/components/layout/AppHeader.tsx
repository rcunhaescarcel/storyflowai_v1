import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Video, Settings, Coins } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { Separator } from "@/components/ui/separator";

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
        <div className="flex items-center gap-2 p-2 rounded-full bg-background/80 border shadow-lg backdrop-blur-sm">
          {/* Logo Section */}
          <div className="flex items-center gap-2 pl-4 pr-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">StoryFlow</span>
          </div>

          {/* Separator */}
          <Separator orientation="vertical" className="h-6" />

          {/* Navigation Section */}
          <nav className="flex items-center gap-1 pr-2">
            <Button
              variant={isCreating ? "secondary" : "ghost"}
              size="sm"
              className="gap-2 rounded-full px-4"
              onClick={handleCreateClick}
            >
              <Sparkles className="w-4 h-4" />
              Criar
            </Button>
            <NavLink to="/videos">
              {({ isActive }) => (
                <Button variant={isActive || isEditingProject ? "secondary" : "ghost"} size="sm" className="gap-2 rounded-full px-4">
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
      </div>
    </header>
  );
};

export default AppHeader;