import { useEffect, useState } from "react";

interface RiskGaugeProps {
  riskScore: number; // 0-100
  riskLevel: "low" | "medium" | "high";
}

export const RiskGauge = ({ riskScore, riskLevel }: RiskGaugeProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(riskScore);
    }, 100);
    return () => clearTimeout(timer);
  }, [riskScore]);

  const getColor = () => {
    if (riskLevel === "low") return "hsl(var(--success))";
    if (riskLevel === "medium") return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const getRiskText = () => {
    if (riskLevel === "low") return "Low Risk";
    if (riskLevel === "medium") return "Medium Risk";
    return "High Risk";
  };

  const rotation = (animatedScore / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <div className="relative w-64 h-32">
        {/* Background arc */}
        <svg className="w-full h-full" viewBox="0 0 200 100">
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Animated arc */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke={getColor()}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${(animatedScore / 100) * 251.2} 251.2`}
            style={{
              transition: "stroke-dasharray 1s ease-out, stroke 0.3s ease",
            }}
          />
          {/* Needle */}
          <line
            x1="100"
            y1="80"
            x2="50"
            y2="80"
            stroke={getColor()}
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${rotation} 100 80)`}
            style={{
              transition: "transform 1s ease-out",
            }}
          />
          <circle cx="100" cy="80" r="6" fill={getColor()} />
        </svg>
      </div>
      
      <div className="text-center">
        <div className="text-5xl font-bold mb-2" style={{ color: getColor() }}>
          {Math.round(animatedScore)}%
        </div>
        <div className="text-xl font-semibold text-foreground">
          {getRiskText()}
        </div>
      </div>
    </div>
  );
};
