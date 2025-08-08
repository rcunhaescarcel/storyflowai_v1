import { Progress } from "@/components/ui/progress";
import { Clapperboard } from "lucide-react";

interface RenderProgressProps {
  progress: number;
  statusText: string;
}

export const RenderProgress = ({ progress, statusText }: RenderProgressProps) => {
  const cleanStatus = statusText.replace(/\[.*?\]\s*/, '');

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)] text-center">
      <div className="relative w-32 h-32 mb-8">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-muted"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="42"
            cx="50"
            cy="50"
          />
          <circle
            className="text-primary"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="42"
            cx="50"
            cy="50"
            strokeDasharray={2 * Math.PI * 42}
            strokeDashoffset={2 * Math.PI * 42 * (1 - progress / 100)}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-foreground">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Renderizando seu vídeo...</h2>
      <p className="text-muted-foreground max-w-md h-10">{cleanStatus}</p>
    </div>
  );
};