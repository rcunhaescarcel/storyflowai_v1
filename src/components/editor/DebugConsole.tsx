import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Trash2, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface DebugConsoleProps {
  logs: string[];
  onCopy: () => void;
  onClear: () => void;
  className?: string;
  defaultOpen?: boolean;
}

export const DebugConsole = ({
  logs,
  onCopy,
  onClear,
  className,
  defaultOpen = false,
}: DebugConsoleProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <div className="flex items-center justify-between mb-3">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 cursor-pointer group">
            <Label className="text-sm font-medium cursor-pointer group-hover:text-primary transition-colors">
              Logs de Debug
            </Label>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform group-hover:text-primary",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopy}
            disabled={logs.length === 0}
          >
            <Copy className="w-3 h-3 mr-1.5" />
            Copiar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={logs.length === 0}
          >
            <Trash2 className="w-3 h-3 mr-1.5" />
            Limpar
          </Button>
        </div>
      </div>
      <CollapsibleContent>
        <ScrollArea className="h-40 w-full rounded-md border bg-muted/50 p-3">
          <div className="space-y-1">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div
                  key={index}
                  className="text-xs font-mono text-muted-foreground"
                >
                  {log}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                Os logs do processo de geração aparecerão aqui...
              </p>
            )}
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
};