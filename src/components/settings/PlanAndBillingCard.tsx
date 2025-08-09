import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Profile } from "@/contexts/SessionContext";
import { Crown, Coins } from "lucide-react";
import { toast } from "sonner";

interface PlanAndBillingCardProps {
  profile: Profile | null;
  monthlyVideoCount: number | undefined;
  isLoadingCount: boolean;
}

const FREE_PLAN_LIMIT = 3;
const COINS_PER_VIDEO = 3;

export const PlanAndBillingCard = ({ profile, monthlyVideoCount, isLoadingCount }: PlanAndBillingCardProps) => {
  const videosCreated = monthlyVideoCount ?? 0;
  const progressValue = (videosCreated / FREE_PLAN_LIMIT) * 100;
  const estimatedVideosWithCoins = Math.floor((profile?.coins ?? 0) / COINS_PER_VIDEO);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <Crown className="w-6 h-6 text-primary" />
          Plano e Faturamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold">Plano Gratuito</h3>
          <p className="text-muted-foreground text-sm mt-1">{FREE_PLAN_LIMIT} vídeos por mês • Qualidade HD</p>
          <div className="mt-4 space-y-2">
            {isLoadingCount ? (
              <>
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </>
            ) : (
              <>
                <Progress value={progressValue} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Você já criou {videosCreated} de {FREE_PLAN_LIMIT} vídeos este mês.
                </p>
              </>
            )}
          </div>
          <Button className="mt-6" onClick={() => toast.info("Funcionalidade em breve!", { description: "A opção de upgrade estará disponível em breve." })}>
            Upgrade
          </Button>
        </div>
        <div className="bg-yellow-400/10 dark:bg-muted border border-yellow-500/20 dark:border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-600 dark:text-primary" />
            Seu Saldo de Coins
          </h3>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-bold">{profile?.coins ?? 0}</span>
            <span className="text-muted-foreground">coins</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Com seu saldo atual, você pode criar aproximadamente mais {estimatedVideosWithCoins} vídeos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};