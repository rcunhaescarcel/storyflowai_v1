import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Play, Zap, Video, Wand2 } from "lucide-react";
// import heroImage from "@/assets/hero-bg.jpg";

const Landing = () => {
  console.log("Landing component rendering...");
  const navigate = useNavigate();

  const features = [
    {
      icon: <Video className="w-8 h-8" />,
      title: "Renderização Inteligente",
      description: "FFmpeg WebAssembly direto no navegador para máxima performance"
    },
    {
      icon: <Wand2 className="w-8 h-8" />,
      title: "Edição Simples",
      description: "Interface intuitiva para combinar imagens, áudio e legendas"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Processamento Local",
      description: "Tudo processado no seu navegador, sem upload para servidores"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-background">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,255,0,0.1)_50%,transparent_75%)] opacity-20" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Viflow IA
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Renderize vídeos com inteligência — simples, direto no seu navegador.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              variant="hero" 
              onClick={() => {
                console.log("Navigating to editor...");
                navigate('/editor');
              }}
              className="group"
            >
              <Play className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform" />
              Acessar Editor
            </Button>
            <Button 
              variant="outline" 
              size="xl" 
              className="border-primary/30 hover:border-primary"
              onClick={() => {
                console.log("Demo button clicked");
                alert("Demo em desenvolvimento!");
              }}
            >
              Ver Demo
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            ⚡ Sem necessidade de login • 🔒 Processamento local • 🎬 Renderização em tempo real
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Tecnologia de <span className="text-primary">Ponta</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-card border border-border rounded-lg p-8 text-center hover:border-primary/50 transition-all duration-300 hover:shadow-glow"
              >
                <div className="text-primary mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 bg-gradient-dark">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para Criar Seus Vídeos?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Comece agora mesmo, sem instalação ou cadastro necessário.
          </p>
          <Button 
            variant="neon" 
            size="xl"
            onClick={() => {
              console.log("Bottom CTA clicked, navigating to editor...");
              navigate('/editor');
            }}
            className="group"
          >
            <Zap className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform" />
            Começar Agora
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;