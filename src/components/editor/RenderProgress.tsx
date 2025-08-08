import { FileCog, Film, Combine, Sparkles, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type RenderStage = 'idle' | 'scenes' | 'concat' | 'final';

interface RenderProgressProps {
  stage: RenderStage;
  progress: number;
  onCancel: () => void;
}

const getActiveStep = (stage: RenderStage) => {
    switch (stage) {
        case 'scenes': return 1;
        case 'concat': return 2;
        case 'final': return 3;
        default: return 0;
    }
};

const getLoadingMessage = (stage: RenderStage) => {
    switch (stage) {
        case 'scenes': return "Renderizando cenas individuais...";
        case 'concat': return "Montando o vídeo...";
        case 'final': return "Adicionando efeitos e finalizando...";
        default: return "Preparando para renderizar...";
    }
}

const steps = [
    { icon: FileCog, label: "Preparando" },
    { icon: Film, label: "Cenas" },
    { icon: Combine, label: "Montagem" },
    { icon: Sparkles, label: "Finalizando" }
];

export const RenderProgress = ({ stage, progress, onCancel }: RenderProgressProps) => {
    const activeStep = getActiveStep(stage);
    const loadingMessage = getLoadingMessage(stage);

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)]">
            <div className="text-center space-y-2 mb-12">
                <h2 className="text-3xl font-bold text-foreground">Sua história está ganhando vida...</h2>
                <p className="text-muted-foreground">Aguarde um momento, a mágica está acontecendo.</p>
            </div>

            <div className="w-full max-w-2xl">
                <div className="flex items-start justify-between relative">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center gap-2 z-10 w-20 text-center">
                            <div className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                index <= activeStep ? "bg-primary border-primary-glow text-primary-foreground" : "bg-muted border-border text-muted-foreground"
                            )}>
                                <step.icon className={cn("w-7 h-7", index === activeStep && "animate-pulse")} />
                            </div>
                            <span className={cn(
                                "font-medium text-sm transition-colors duration-500",
                                index <= activeStep ? "text-foreground" : "text-muted-foreground"
                            )}>{step.label}</span>
                        </div>
                    ))}
                    <div className="absolute top-8 left-10 w-[calc(100%-5rem)] h-1 bg-border -z-0">
                        <div 
                            className="h-full bg-gradient-primary transition-all duration-500"
                            style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="w-full max-w-md text-center space-y-3 pt-12">
                <p className="text-lg font-medium text-primary h-6">{loadingMessage}</p>
                <Progress value={progress} className="w-full h-2" />
                <p className="text-sm text-muted-foreground">{Math.round(progress)}% concluído</p>
            </div>

            <div className="mt-12">
              <Button variant="outline" onClick={onCancel}>
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar Renderização
              </Button>
            </div>
        </div>
    );
};