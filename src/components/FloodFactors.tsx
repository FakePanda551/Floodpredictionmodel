import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface Factor {
  name: string;
  contribution: number; // -100 to 100
  description: string;
}

interface FloodFactorsProps {
  factors: Factor[];
}

export const FloodFactors = ({ factors }: FloodFactorsProps) => {
  const getFactorIcon = (contribution: number) => {
    if (contribution > 30) return <AlertTriangle className="h-5 w-5 text-destructive" />;
    if (contribution < -10) return <CheckCircle className="h-5 w-5 text-success" />;
    return <Info className="h-5 w-5 text-warning" />;
  };

  const getBarColor = (contribution: number) => {
    if (contribution > 30) return "bg-destructive";
    if (contribution < -10) return "bg-success";
    return "bg-warning";
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Risk Factors Analysis</h3>
      <div className="space-y-4">
        {factors.map((factor, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getFactorIcon(factor.contribution)}
                <span className="font-semibold">{factor.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {factor.contribution > 0 ? "+" : ""}{factor.contribution}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${getBarColor(factor.contribution)} transition-all duration-500`}
                style={{ width: `${Math.abs(factor.contribution)}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{factor.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};
