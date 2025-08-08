import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="container flex h-14 max-w-screen-2xl items-center px-6 sm:px-8 md:px-12 lg:px-24">
        <div className="mr-4 flex items-center">
          <a href="/" className="mr-6 flex items-center space-x-2">
            <Sparkles className="h-6 w-6" stroke="url(#icon-gradient)" />
            <span className="font-bold">StoryFlow</span>
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