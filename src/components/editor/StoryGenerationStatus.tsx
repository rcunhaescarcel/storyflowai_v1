import { FileText, Image, Mic, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface StoryGenerationStatusProps {
    loadingMessage: string;
    progress: number;
}

const getActiveStep = (message: string, progress: number) => {
    const lowerCaseMessage = message.toLowerCase();
    if (lowerCaseMessage.includes("finalizando") || progress >= 95) return 3;
    if (lowerCaseMessage.includes("narração") || progress >= 55) return 2;
    if (lowerCaseMessage.includes("imagem") || lowerCaseMessage.includes("personagem") || progress >= 15) return 1;
    if (lowerCaseMessage.includes("roteiro") || progress < 15) return 0;
    return 0; // Default
};

const steps = [
    { icon: FileText, label: "Roteiro" },
    { icon: Image, label: "Imagens" },
    { icon: Mic, label: "Narração" },
    { icon: Sparkles, label: "Finalizando" }
];

export const StoryGenerationStatus = ({ loadingMessage, progress }: StoryGenerationStatusProps) => {
    const activeStep = getActiveStep(loadingMessage, progress);

    return (
        <div className="flex flex-col items-center justify-center gap-8 h-full w-full">
            <div className="text-center space-y-2">
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

            <div className="w-full max-w-md text-center space-y-3 pt-8">
                <p className="text-lg font-medium text-primary h-6">{loadingMessage}</p>
                <Progress value={progress} className="w-full h-2" />
                <p className="text-sm text-muted-foreground">{Math.round(progress)}% concluído</p>
            </div>
        </div>
    );
};