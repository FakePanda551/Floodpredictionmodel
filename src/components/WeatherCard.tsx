import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface WeatherCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  impact: "positive" | "neutral" | "negative";
}

export const WeatherCard = ({ icon: Icon, label, value, impact }: WeatherCardProps) => {
  const getImpactColor = () => {
    if (impact === "positive") return "text-success";
    if (impact === "negative") return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow border-2">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-secondary ${getImpactColor()}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
};
