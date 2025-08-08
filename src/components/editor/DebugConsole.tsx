import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Trash2 } from "lucide-react";

interface DebugConsoleProps {
  logs: string[];
  onCopy: () => void;
  onClear: () => void;
  className?: string;
}

export const DebugConsole = ({ logs, onCopy, onClear, className }: DebugConsoleProps) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <Label className="text-sm font-medium">Logs de Debug</Label>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCopy} disabled={logs.length === 0}>
            <Copy className="w-3 h-3 mr-1.5" />
            Copiar
          </Button>
          <Button variant="ghost" size="sm" onClick={onClear} disabled={logs.length === 0}>
            <Trash2 className="w-3 h-3 mr-1.5" />
            Limpar
          </Button>
        </div>
      </div>
      <ScrollArea className="h-40 w-full rounded-md border bg-muted/50 p-3">
        <div className="space-y-1">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="text-xs font-mono text-muted-foreground">
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
    </div>
  );
};