import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Play, Zap, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: "Animações Mágicas com IA",
      description: "Nossa IA analisa suas imagens e cria movimentos de câmera e efeitos que dão vida à sua história."
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Renderização Ultra-Rápida",
      description: "Processe vídeos diretamente no seu navegador em tempo recorde, sem filas de espera ou uploads demorados."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
      title: "Privacidade Total",
      description: "Seus arquivos nunca saem do seu computador. Todo o processamento é feito localmente para sua segurança."
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10 px-6 sm:px-8 md:px-12 lg:px-24">
          <div className="text-center lg:text-start space-y-6">
            <main className="text-5xl md:text-6xl font-bold">
              <h1 className="inline">
                <span className="inline bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text">
                  Crie vídeos
                </span>{" "}
                no estilo Pixar
              </h1>{" "}
              com a magia da{" "}
              <h2 className="inline">
                <span className="inline bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text">
                  Inteligência Artificial
                </span>
              </h2>
            </main>

            <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
              Transforme suas imagens, áudios e legendas em animações encantadoras em minutos, diretamente no seu navegador.
            </p>

            <div className="space-y-4 md:space-y-0 md:space-x-4">
              <Button 
                className="w-full md:w-1/3"
                onClick={() => navigate('/editor')}
              >
                Criar Meu Vídeo Grátis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Hero visual */}
          <div className="z-10">
            <div className="relative w-full max-w-lg">
              <div className="absolute -top-8 -left-8 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-8 -right-8 w-72 h-72 bg-primary/5 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-200"></div>
              <div className="relative shadow-2xl rounded-2xl overflow-hidden">
                <div className="px-4 py-2 bg-muted/40 border-b">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <img
                  src="https://0eeb6b826f9e83756195697eae0f522e.cdn.bubble.io/f1754575804125x446543522981079230/ChatGPT%20Image%205%20de%20ago.%20de%202025%2C%2018_10_34.png"
                  alt="Personagem 3D em um ambiente criativo, no estilo Pixar"
                  className="w-full object-cover object-center"
                  crossOrigin="anonymous"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container py-24 sm:py-32 space-y-8 px-6 sm:px-8 md:px-12 lg:px-24">
          <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
            Tudo que você precisa para{" "}
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text">
              criar vídeos incríveis
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon, title, description }) => (
              <div key={title} className="bg-muted/50 border rounded-lg p-8 group transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:-translate-y-2">
                <div className="mb-4">{icon}</div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="container text-center py-24 sm:py-32 px-6 sm:px-8 md:px-12 lg:px-24">
          <h2 className="text-3xl md:text-4xl font-bold">
            Como Funciona em{" "}
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text">
              3 Passos Simples
            </span>
          </h2>
          <p className="md:w-3/4 mx-auto mt-4 mb-16 text-xl text-muted-foreground">
            Nosso processo intuitivo permite que você crie vídeos com aparência profissional sem nenhuma experiência em edição.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full text-2xl font-bold">1</div>
              <h3 className="text-2xl font-bold">Upload</h3>
              <p className="text-muted-foreground">
                Envie suas imagens, narrações e arquivos de legenda. Organize tudo cena por cena.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full text-2xl font-bold">2</div>
              <h3 className="text-2xl font-bold">Magia da IA</h3>
              <p className="text-muted-foreground">
                Nossa IA aplica zoom, panorâmica e transições para dar vida ao seu conteúdo de forma inteligente.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full text-2xl font-bold">3</div>
              <h3 className="text-2xl font-bold">Renderize e Exporte</h3>
              <p className="text-muted-foreground">
                Renderize o vídeo final em alta velocidade e faça o download em MP4 para compartilhar onde quiser.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="bg-muted/50">
          <div className="container py-24 sm:py-32 text-center px-6 sm:px-8 md:px-12 lg:px-24">
            <h2 className="text-3xl md:text-4xl font-bold">
              Pronto para dar vida às suas ideias?
            </h2>
            <p className="text-xl text-muted-foreground mt-4 mb-8">
              Comece a criar seu primeiro vídeo animado agora mesmo. É grátis e não precisa de cadastro.
            </p>
            <Button 
              className="w-full md:w-auto"
              onClick={() => navigate('/editor')}
            >
              Começar a Criar
              <Play className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;