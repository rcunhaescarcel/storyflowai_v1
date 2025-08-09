import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Play, ArrowRight, UploadCloud, Palette, FileText, Video } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { StyleCard } from "@/components/landing/StyleCard";
import { PricingCard } from "@/components/landing/PricingCard";
import { TestimonialCard } from "@/components/landing/TestimonialCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Landing = () => {
  const navigate = useNavigate();

  const howItWorksSteps = [
    {
      icon: <UploadCloud className="w-10 h-10 text-primary" />,
      title: "Envie seu personagem",
      description: "Use uma imagem sua, de um mascote ou crie um novo."
    },
    {
      icon: <Palette className="w-10 h-10 text-primary" />,
      title: "Escolha um estilo visual",
      description: "Pixar 3D, Ghibli 2D, Livro Ilustrado ou HQ Colorida."
    },
    {
      icon: <FileText className="w-10 h-10 text-primary" />,
      title: "Escreva sua ideia",
      description: "Conte o que vai acontecer na história ou use um dos prompts prontos."
    },
    {
      icon: <Video className="w-10 h-10 text-primary" />,
      title: "Receba seu vídeo pronto",
      description: "Com narração, imagens consistentes, legendas e efeitos."
    }
  ];

  const styles = [
    {
      title: "Pixar 3D Cinemático",
      description: "Realismo mágico e detalhes dignos de cinema."
    },
    {
      title: "Ghibli 2D Poético",
      description: "Cores suaves e atmosfera encantada."
    },
    {
      title: "Livro Infantil Ilustrado",
      description: "Aquarela calorosa e traço orgânico."
    },
    {
      title: "HQ/Cartoon Colorido",
      description: "Energia, humor e ação vibrante."
    }
  ];

  const testimonials = [
    {
      quote: "Em minutos criei uma série inteira com meu mascote. As crianças adoraram!",
      author: "Lucas M.",
      role: "Criador Infantil"
    },
    {
      quote: "Meus alunos ficaram vidrados nas histórias ilustradas. Muito fácil de usar.",
      author: "Ana P.",
      role: "Professora"
    },
    {
      quote: "Economizei horas de produção. O StoryFlow faz tudo.",
      author: "Marcelo F.",
      role: "Youtuber"
    }
  ];

  const faqItems = [
    {
      question: "Como funcionam os créditos?",
      answer: "Cada geração de cena consome 1 crédito. No final, o vídeo completo é renderizado. Planos pagos oferecem mais créditos para histórias mais longas e complexas."
    },
    {
      question: "Posso usar meus vídeos comercialmente?",
      answer: "Sim, todos os vídeos criados na plataforma, inclusive no plano gratuito, podem ser usados para fins comerciais, como monetização no YouTube, Instagram e outras plataformas."
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Sim, nossos planos são sem fidelidade. Você pode cancelar sua assinatura a qualquer momento, sem taxas ou burocracia."
    },
    {
      question: "Meu personagem fica salvo?",
      answer: "Sim, ao fazer o upload de um personagem, ele fica salvo na sua biblioteca pessoal para ser reutilizado em quantas histórias você quiser, mantendo a consistência visual."
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
          <div className="text-center lg:text-start space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              Crie Histórias Animadas com{" "}
              <span className="inline bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text">
                IA em Minutos
              </span>
            </h1>
            <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
              Faça upload do seu personagem, escolha um estilo mágico e veja sua ideia ganhar vida com imagens, voz, legendas e efeitos — tudo pronto para compartilhar.
            </p>
            <div className="space-y-4 md:space-y-0 md:space-x-4">
              <Button className="w-full md:w-auto" size="lg" onClick={() => navigate('/editor')}>
                Comece Grátis Agora <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button className="w-full md:w-auto" size="lg" variant="outline">
                Veja Histórias Criadas <Play className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
          <div className="relative w-full max-w-lg">
            <div className="absolute -top-8 -left-8 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-8 -right-8 w-72 h-72 bg-primary/5 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-200"></div>
            <div className="relative shadow-2xl rounded-2xl overflow-hidden">
              <img
                src="https://0eeb6b826f9e83756195697eae0f522e.cdn.bubble.io/f1754690261301x876398286890502700/ChatGPT%20Image%205%20de%20ago.%20de%202025%2C%2018_10_30.png"
                alt="Personagem 3D lendo um livro em um ambiente mágico, no estilo Pixar"
                className="w-full object-cover object-center"
                crossOrigin="anonymous"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="container text-center py-24 sm:py-32">
          <div className="max-w-screen-lg mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">
              Sua história pronta em{" "}
              <span className="bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text">
                4 passos
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mt-16">
              {howItWorksSteps.map((step) => (
                <div key={step.title} className="flex flex-col items-center gap-4">
                  <div className="flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full text-3xl font-bold mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Styles Section */}
        <section id="styles" className="container py-24 sm:py-32">
          <div className="max-w-screen-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center">
              Quatro estilos para dar{" "}
              <span className="bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text">
                vida ao seu mundo
              </span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
              {styles.map(style => <StyleCard key={style.title} {...style} />)}
            </div>
          </div>
        </section>

        {/* Examples Section */}
        <section id="examples" className="container py-24 sm:py-32">
          <div className="max-w-screen-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center">
              Veja o que já foi criado no{" "}
              <span className="bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text">
                StoryFlow
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden group cursor-pointer aspect-video bg-muted/50">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-12 h-12 text-white fill-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container py-24 sm:py-32">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center">
              Escolha o plano que{" "}
              <span className="bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text">
                combina com você
              </span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
              <PricingCard 
                planName="Free"
                price="R$ 0"
                description="Para começar a criar"
                features={["10 créditos/mês", "Vídeos até 30 segundos", "2 estilos lúdicos disponíveis", "1 personagem da biblioteca", "Renderização direta (sem edição)"]}
                ctaText="Criar Conta Grátis"
              />
              <PricingCard 
                planName="Pro"
                price="R$ 49,90"
                description="Para criadores dedicados"
                features={["100 créditos/mês", "Vídeos até 2 minutos", "Todos os 4 estilos lúdicos", "Upload de personagem próprio", "Edição de cenas antes da renderização", "Logo personalizado"]}
                ctaText="Assinar Pro"
                isPopular
              />
              <PricingCard 
                planName="Premium"
                price="R$ 99,90"
                description="Para poder ilimitado"
                features={["300 créditos/mês", "Vídeos até 5 minutos", "Biblioteca ilimitada de personagens", "Efeitos avançados: zoom dinâmico", "Exportação 4K", "Suporte prioritário via chat"]}
                ctaText="Assinar Premium"
              />
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section id="social-proof" className="bg-muted/50">
          <div className="container py-24 sm:py-32">
            <div className="max-w-screen-xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center">
                Criadores do mundo todo já estão encantando com o{" "}
                <span className="bg-gradient-to-r from-gradient-from to-gradient-to text-transparent bg-clip-text">
                  StoryFlow
                </span>
              </h2>
              <div className="grid md:grid-cols-3 gap-8 mt-16">
                {testimonials.map(testimonial => <TestimonialCard key={testimonial.author} {...testimonial} />)}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="container py-24 sm:py-32">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Perguntas Frequentes
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-lg">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;