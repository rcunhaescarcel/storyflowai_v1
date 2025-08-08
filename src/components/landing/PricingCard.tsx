import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  planName: string;
  price: string;
  description: string;
  features: string[];
  ctaText: string;
  isPopular?: boolean;
}

export const PricingCard = ({ planName, price, description, features, ctaText, isPopular }: PricingCardProps) => {
  return (
    <Card className={cn("flex flex-col", isPopular && "border-primary shadow-lg")}>
      <CardHeader className="relative">
        {isPopular && <Badge className="absolute top-0 -translate-y-1/2">Mais Popular</Badge>}
        <CardTitle>{planName}</CardTitle>
        <div className="flex items-baseline gap-2 pt-4">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground">/mês</span>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={isPopular ? "default" : "outline"}>
          {ctaText}
        </Button>
      </CardFooter>
    </Card>
  );
};