import { Sparkles, Youtube, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6" stroke="url(#icon-gradient)" />
            <span className="font-bold text-lg">StoryFlow</span>
          </div>
          <p className="text-muted-foreground text-sm">Histórias com IA</p>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-semibold">Links Rápidos</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><a href="#how-it-works" className="hover:text-primary">Funcionalidades</a></li>
            <li><a href="#pricing" className="hover:text-primary">Preços</a></li>
            <li><a href="#examples" className="hover:text-primary">Exemplos</a></li>
            <li><a href="#" className="hover:text-primary">Suporte</a></li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Legal</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><a href="#" className="hover:text-primary">Termos de Serviço</a></li>
            <li><a href="#" className="hover:text-primary">Política de Privacidade</a></li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Social</h4>
          <div className="flex gap-4">
            <a href="#" className="text-muted-foreground hover:text-primary"><Youtube /></a>
            <a href="#" className="text-muted-foreground hover:text-primary"><Instagram /></a>
            <a href="#" className="text-muted-foreground hover:text-primary"><Twitter /></a>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} StoryFlow – Histórias com IA
        </div>
      </div>
    </footer>
  );
};

export default Footer;