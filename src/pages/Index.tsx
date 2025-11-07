import { useState } from "react";
import { CitySearch } from "@/components/CitySearch";
import { RiskGauge } from "@/components/RiskGauge";
import { WeatherCard } from "@/components/WeatherCard";
import { FloodFactors } from "@/components/FloodFactors";
import { CloudRain, Droplets, Thermometer, Wind } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PredictionResult {
  city: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  weather: {
    temperature: number;
    rainfall: number;
    humidity: number;
    windSpeed: number;
  };
  factors: Array<{
    name: string;
    contribution: number;
    description: string;
  }>;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  const handleSearch = async (city: string) => {
    setIsLoading(true);
    setPrediction(null);

    try {
      const { data, error } = await supabase.functions.invoke("predict-flood-risk", {
        body: { city },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setPrediction(data);
      toast.success(`Flood risk analysis complete for ${city}`);
    } catch (error) {
      console.error("Prediction error:", error);
      toast.error("Failed to predict flood risk. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherImpact = (value: number, type: "rainfall" | "humidity" | "temp" | "wind") => {
    if (type === "rainfall") return value > 50 ? "negative" : value < 20 ? "positive" : "neutral";
    if (type === "humidity") return value > 80 ? "negative" : "neutral";
    if (type === "temp") return value > 30 ? "neutral" : "positive";
    return "neutral";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            FloodGuard AI
          </h1>
          <p className="text-muted-foreground mt-1">
            ML-Powered Flood Risk Prediction System
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="space-y-12">
          {/* Search Section */}
          <section className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold">Predict Flood Risk</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Enter any city name to analyze real-time weather data and predict flood likelihood
                using machine learning algorithms.
              </p>
            </div>
            <div className="flex justify-center">
              <CitySearch onSearch={handleSearch} isLoading={isLoading} />
            </div>
          </section>

          {/* Results Section */}
          {prediction && (
            <section className="space-y-8 animate-in fade-in duration-500">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">
                  Analysis Results for {prediction.city}
                </h3>
                <p className="text-muted-foreground">
                  Based on current weather conditions and historical data
                </p>
              </div>

              {/* Risk Gauge */}
              <div className="flex justify-center">
                <div className="bg-card rounded-2xl shadow-lg border-2">
                  <RiskGauge
                    riskScore={prediction.riskScore}
                    riskLevel={prediction.riskLevel}
                  />
                </div>
              </div>

              {/* Weather Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <WeatherCard
                  icon={Thermometer}
                  label="Temperature"
                  value={`${prediction.weather.temperature}°C`}
                  impact={getWeatherImpact(prediction.weather.temperature, "temp")}
                />
                <WeatherCard
                  icon={CloudRain}
                  label="Rainfall"
                  value={`${prediction.weather.rainfall}mm`}
                  impact={getWeatherImpact(prediction.weather.rainfall, "rainfall")}
                />
                <WeatherCard
                  icon={Droplets}
                  label="Humidity"
                  value={`${prediction.weather.humidity}%`}
                  impact={getWeatherImpact(prediction.weather.humidity, "humidity")}
                />
                <WeatherCard
                  icon={Wind}
                  label="Wind Speed"
                  value={`${prediction.weather.windSpeed} km/h`}
                  impact={getWeatherImpact(prediction.weather.windSpeed, "wind")}
                />
              </div>

              {/* Flood Factors */}
              <FloodFactors factors={prediction.factors} />
            </section>
          )}

          {/* Info Section */}
          {!prediction && !isLoading && (
            <section className="max-w-3xl mx-auto text-center space-y-4 py-12">
              <div className="p-6 bg-card rounded-xl border">
                <h3 className="text-xl font-bold mb-3">How It Works</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our ML model analyzes real-time weather data including rainfall, temperature,
                  humidity, and wind patterns. Combined with historical flood data, it predicts
                  the likelihood of flooding in your selected city. The Random Forest algorithm
                  processes multiple environmental factors to provide accurate risk assessments.
                </p>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8 bg-card/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>FloodGuard AI - Powered by Machine Learning & Real-Time Weather Data</p>
          <p className="mt-2">MVP Version - Predictions are for demonstration purposes</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
