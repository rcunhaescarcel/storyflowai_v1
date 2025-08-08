import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StyleCardProps {
  image: string;
  title: string;
  description: string;
}

export const StyleCard = ({ image, title, description }: StyleCardProps) => {
  return (
    <Card className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
      <div className="overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          crossOrigin="anonymous"
        />
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