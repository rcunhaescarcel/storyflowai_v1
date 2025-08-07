import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <a href="/" className="mr-6 flex items-center space-x-2">
            <Wand2 className="h-6 w-6 text-primary" />
            <span className="font-bold">Viflow IA</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button onClick={() => navigate('/editor')}>
            Criar Vídeo
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;