import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  currentPassword: z.string().min(1, "A senha atual é obrigatória."),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres."),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

export const PasswordChangeModal = ({ isOpen, onClose }: PasswordChangeModalProps) => {
  const { session } = useSession();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session?.user?.email) {
      toast.error("Não foi possível identificar o usuário.");
      return;
    }

    setIsSaving(true);
    try {
      // Etapa 1: Verificar a senha atual.
      // Este é um passo de segurança do lado do cliente para garantir que o usuário conhece a senha antiga.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: values.currentPassword,
      });

      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          toast.error("Senha atual incorreta.", {
            description: "Por favor, verifique sua senha atual e tente novamente.",
          });
        } else {
          toast.error("Erro ao verificar a senha.", {
            description: signInError.message,
          });
        }
        return; // Interrompe a execução se a verificação falhar.
      }
      
      // Etapa 2: Se a verificação for bem-sucedida, atualize para a nova senha.
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (updateError) {
        toast.error("Falha ao alterar a senha.", {
          description: `Ocorreu um erro inesperado. Tente novamente. (${updateError.message})`,
        });
      } else {
        toast.success("Senha alterada com sucesso!");
        form.reset();
        onClose();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      toast.error("Ocorreu um erro inesperado.", {
        description: message,
      });
    } finally {
      // Este bloco é SEMPRE executado, garantindo que o botão de salvar não fique travado.
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Senha</DialogTitle>
          <DialogDescription>
            Para sua segurança, informe sua senha atual antes de definir uma nova.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha Atual</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} placeholder="••••••••" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Senha</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} placeholder="••••••••" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nova Senha</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} placeholder="••••••••" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Nova Senha
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};