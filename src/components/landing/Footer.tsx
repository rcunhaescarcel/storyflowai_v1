import { Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0 px-6 sm:px-8 md:px-12 lg:px-24">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Sparkles className="h-6 w-6" stroke="url(#icon-gradient)" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Construído com ❤️ para a comunidade de criadores.
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Viflow IA. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;