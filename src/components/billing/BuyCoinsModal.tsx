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
    icon: <Coins className="w-6 h-6 text-yellow-500" />,
    amount: 50,
    price: 4.99,
    bgColor: "bg-yellow-500/10",
  },
  {
    icon: <Sparkles className="w-6 h-6 text-primary" />,
    amount: 150,
    price: 12.99,
    bgColor: "bg-primary/10",
    popular: true,
  },
  {
    icon: <Zap className="w-6 h-6 text-blue-500" />,
    amount: 300,
    price: 19.99,
    bgColor: "bg-blue-500/10",
  },
  {
    icon: <Crown className="w-6 h-6 text-green-500" />,
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
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center flex-shrink-0">
              <Coins className="w-7 h-7 text-yellow-500" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Comprar Coins</DialogTitle>
              <DialogDescription>
                Seu saldo atual: {profile?.coins ?? 0} coins
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {coinPackages.map((pkg) => (
            <div
              key={pkg.amount}
              className={`relative border rounded-xl p-4 flex items-center gap-4 transition-all duration-300 hover:border-primary/80 hover:bg-muted/50 ${
                pkg.popular ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 right-4">Popular</Badge>
              )}
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${pkg.bgColor}`}
              >
                {pkg.icon}
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">{pkg.amount} coins</p>
                <p className="text-muted-foreground text-sm">
                  ${pkg.price.toFixed(2)}
                </p>
              </div>
              <Button
                onClick={handleBuy}
                variant={pkg.popular ? "default" : "outline"}
                size="sm"
              >
                Comprar
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Pagamento seguro via Stripe</span>
          <span>•</span>
          <span>Coins não expiram</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};