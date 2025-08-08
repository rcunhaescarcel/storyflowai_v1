import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
}

export const TestimonialCard = ({ quote, author, role }: TestimonialCardProps) => {
  return (
    <Card className="p-6 bg-muted/50 border-border">
      <CardContent className="p-0">
        <Quote className="w-8 h-8 text-primary/50 mb-4" />
        <p className="mb-4 text-foreground">"{quote}"</p>
        <div className="font-semibold">{author}</div>
        <div className="text-sm text-muted-foreground">{role}</div>
      </CardContent>
    </Card>
  );
};