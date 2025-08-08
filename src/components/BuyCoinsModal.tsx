import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/contexts/SessionContext";
import { Coins, Sparkles, Zap, Crown, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface BuyCoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const coinPackages = [
  {
    icon: <Coins className="w-8 h-8 text-yellow-500" />,
    amount: 50,
    price: 4.99,
    bgColor: "bg-yellow-500/10",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-primary" />,
    amount: 150,
    price: 12.99,
    bgColor: "bg-primary/10",
    popular: true,
  },
  {
    icon: <Zap className="w-8 h-8 text-blue-500" />,
    amount: 300,
    price: 19.99,
    bgColor: "bg-blue-500/10",
  },
  {
    icon: <Crown className="w-8 h-8 text-green-500" />,
    amount: 500,
    price: 29.99,
    bgColor: "bg-green-500/10",
  },
];

export const BuyCoinsModal = ({ isOpen, onClose }: BuyCoinsModalProps) => {
  const { profile } = useSession();

  const handleBuy = () => {
    toast.info("Funcionalidade em breve!", {
      description: "A compra de coins será implementada em breve.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl p-8">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center">
              <Coins className="w-7 h-7 text-yellow-500" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Comprar Coins</DialogTitle>
              <DialogDescription>
                Saldo atual: {profile?.coins ?? 0} coins
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="my-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <h4 className="font-semibold mb-2">Como funcionam os Coins?</h4>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>1 vídeo de 60s = 3 coins</li>
            <li>1 vídeo de 2min = 6 coins</li>
            <li>Regenerar cena = 1 coin</li>
            <li>Personalizar personagem = 2 coins</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {coinPackages.map((pkg) => (
            <div
              key={pkg.amount}
              className={`relative border rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 ${
                pkg.popular ? "border-primary shadow-lg" : "border-border"
              }`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3">Mais Popular</Badge>
              )}
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${pkg.bgColor}`}
              >
                {pkg.icon}
              </div>
              <p className="text-4xl font-bold">{pkg.amount}</p>
              <p className="text-muted-foreground mb-4">coins</p>
              <p className="text-2xl font-semibold text-primary mb-6">
                ${pkg.price.toFixed(2)}
              </p>
              <Button
                onClick={handleBuy}
                variant={pkg.popular ? "default" : "outline"}
                className="w-full mt-auto"
              >
                Comprar
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center text-xs text-muted-foreground mt-6 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Pagamento seguro via Stripe
          </span>
          <span>•</span>
          <span>Sem taxas adicionais</span>
          <span>•</span>
          <span>Coins nunca expiram</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};