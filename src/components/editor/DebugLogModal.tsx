import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Trash2, Bug } from "lucide-react";

interface DebugLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: string[];
  onCopy: () => void;
  onClear: () => void;
}

export const DebugLogModal = ({ isOpen, onClose, logs, onCopy, onClear }: DebugLogModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-primary" />
            Logs de Debug
          </DialogTitle>
          <DialogDescription>
            Aqui você pode ver os logs detalhados do processo de geração.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72 w-full rounded-md border bg-muted/50 p-3">
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
                Nenhum log para exibir. Inicie um processo para ver os logs.
              </p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={logs.length === 0}
          >
            <Trash2 className="w-3 h-3 mr-1.5" />
            Limpar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCopy}
            disabled={logs.length === 0}
          >
            <Copy className="w-3 h-3 mr-1.5" />
            Copiar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};