import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wand2, Video, Settings, Coins } from "lucide-react";

const AppHeader = () => {
  return (
    <header className="sticky top-4 z-50 w-full">
      <div className="container flex items-center justify-center">
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
          <div className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-muted-foreground border-l ml-1">
            <Coins className="w-4 h-4" />
            <span>578 Coins</span>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;