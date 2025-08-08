import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";

interface StyleCardProps {
  title: string;
  description: string;
}

export const StyleCard = ({ title, description }: StyleCardProps) => {
  return (
    <Card className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
      <div className="overflow-hidden h-48 bg-muted/50 flex items-center justify-center">
        <ImageIcon className="w-16 h-16 text-muted-foreground/50 group-hover:scale-110 transition-transform duration-500" />
      </div>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};