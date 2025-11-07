import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CitySearchProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

export const CitySearch = ({ onSearch, isLoading }: CitySearchProps) => {
  const [city, setCity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter city name (e.g., Miami, Venice, Mumbai)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="pl-10 h-12 text-lg border-2"
            disabled={isLoading}
          />
        </div>
        <Button 
          type="submit" 
          size="lg" 
          disabled={isLoading || !city.trim()}
          className="h-12 px-8"
        >
          {isLoading ? "Analyzing..." : "Predict Risk"}
        </Button>
      </div>
    </form>
  );
};
