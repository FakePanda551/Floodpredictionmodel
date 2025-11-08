import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { NavLink } from "@/components/NavLink";
import { ArrowLeft, TrendingUp, Activity, MapPin } from "lucide-react";

interface DataPoint {
  [key: string]: any;
}

const Analytics = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/flood_risk_dataset_india.csv");
        const text = await response.text();
        const rows = text.split("\n");
        const headers = rows[0].split(",").map(h => h.trim());
        
        const parsedData = rows.slice(1)
          .filter(row => row.trim())
          .map(row => {
            const values = row.split(",");
            const obj: DataPoint = {};
            headers.forEach((header, i) => {
              const value = values[i]?.trim();
              obj[header] = isNaN(Number(value)) ? value : Number(value);
            });
            return obj;
          });

        setData(parsedData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Process data for visualizations
  const monthlyRainfall = () => {
    const monthly: { [key: string]: { total: number; count: number } } = {};
    data.forEach(d => {
      if (d.Month) {
        if (!monthly[d.Month]) monthly[d.Month] = { total: 0, count: 0 };
        monthly[d.Month].total += d["Rainfall (mm)"] || 0;
        monthly[d.Month].count += 1;
      }
    });
    return Object.entries(monthly).map(([month, values]) => ({
      month,
      avgRainfall: Number((values.total / values.count).toFixed(2)),
    }));
  };

  const stateRainfall = () => {
    const states: { [key: string]: number[] } = {};
    data.forEach(d => {
      if (d.State) {
        if (!states[d.State]) states[d.State] = [];
        states[d.State].push(d["Rainfall (mm)"] || 0);
      }
    });
    return Object.entries(states).slice(0, 10).map(([state, values]) => ({
      state,
      min: Math.min(...values),
      q1: values.sort((a, b) => a - b)[Math.floor(values.length * 0.25)],
      median: values.sort((a, b) => a - b)[Math.floor(values.length * 0.5)],
      q3: values.sort((a, b) => a - b)[Math.floor(values.length * 0.75)],
      max: Math.max(...values),
      avg: Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
    }));
  };

  const correlationData = () => {
    const features = [
      "Rainfall (mm)",
      "Temperature (°C)",
      "Humidity (%)",
      "River Discharge (m³/s)",
      "Water Level (m)",
    ];

    return features.map(f1 => {
      const row: any = { feature: f1.split(" ")[0] };
      features.forEach(f2 => {
        const key = f2.split(" ")[0];
        const correlation = calculateCorrelation(
          data.map(d => d[f1]),
          data.map(d => d[f2])
        );
        row[key] = correlation;
      });
      return row;
    });
  };

  const calculateCorrelation = (x: number[], y: number[]) => {
    const n = x.length;
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    
    const num = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
    const denX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0));
    const denY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0));
    
    return ((num / (denX * denY)) || 0).toFixed(3);
  };

  const floodDistribution = () => {
    const flooded = data.filter(d => d["Flood Occurred"] === 1 || d["Flood Occurred"] === "Yes").length;
    const notFlooded = data.length - flooded;
    return [
      { name: "Flood Occurred", value: flooded, color: "hsl(var(--warning))" },
      { name: "No Flood", value: notFlooded, color: "hsl(var(--success))" },
    ];
  };

  const scatterData = () => {
    return data.slice(0, 500).map(d => ({
      rainfall: d["Rainfall (mm)"],
      humidity: d["Humidity (%)"],
      flood: d["Flood Occurred"] === 1 || d["Flood Occurred"] === "Yes" ? 1 : 0,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center">
        <div className="text-foreground text-xl">Loading analytics data...</div>
      </div>
    );
  }

  const monthlyData = monthlyRainfall();
  const stateData = stateRainfall();
  const correlations = correlationData();
  const floodDist = floodDistribution();
  const scatter = scatterData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <header className="border-b bg-card/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <NavLink
              to="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Prediction</span>
            </NavLink>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Flood Risk Analytics
              </h1>
              <p className="text-muted-foreground text-sm">
                Exploratory Data Analysis of Indian Flood Dataset
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-background/20 backdrop-blur-md">
            <TabsTrigger value="trends" className="data-[state=active]:bg-primary">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="distribution" className="data-[state=active]:bg-primary">
              <Activity className="h-4 w-4 mr-2" />
              Distribution
            </TabsTrigger>
            <TabsTrigger value="correlation" className="data-[state=active]:bg-primary">
              Correlation
            </TabsTrigger>
            <TabsTrigger value="scatter" className="data-[state=active]:bg-primary">
              Scatter
            </TabsTrigger>
            <TabsTrigger value="flood" className="data-[state=active]:bg-primary">
              Flood Count
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <Card className="bg-background/80 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Monthly Rainfall Trends
                </CardTitle>
                <CardDescription>
                  Average rainfall across different months showing seasonal patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgRainfall"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Avg Rainfall (mm)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <Card className="bg-background/80 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  State-wise Rainfall Distribution
                </CardTitle>
                <CardDescription>
                  Average rainfall distribution across top 10 states
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={stateData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="state" stroke="hsl(var(--foreground))" angle={-45} textAnchor="end" height={100} />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="avg" fill="hsl(var(--primary))" name="Avg Rainfall (mm)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="correlation" className="space-y-6">
            <Card className="bg-background/80 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle>Feature Correlation Matrix</CardTitle>
                <CardDescription>
                  Correlation between different environmental features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-border p-2 bg-muted">Feature</th>
                        <th className="border border-border p-2 bg-muted">Rainfall</th>
                        <th className="border border-border p-2 bg-muted">Temperature</th>
                        <th className="border border-border p-2 bg-muted">Humidity</th>
                        <th className="border border-border p-2 bg-muted">River</th>
                        <th className="border border-border p-2 bg-muted">Water</th>
                      </tr>
                    </thead>
                    <tbody>
                      {correlations.map((row, i) => (
                        <tr key={i}>
                          <td className="border border-border p-2 font-medium">{row.feature}</td>
                          <td
                            className="border border-border p-2 text-center"
                            style={{
                              backgroundColor: `hsl(var(--primary) / ${Math.abs(row.Rainfall) * 0.3})`,
                            }}
                          >
                            {row.Rainfall}
                          </td>
                          <td
                            className="border border-border p-2 text-center"
                            style={{
                              backgroundColor: `hsl(var(--primary) / ${Math.abs(row.Temperature) * 0.3})`,
                            }}
                          >
                            {row.Temperature}
                          </td>
                          <td
                            className="border border-border p-2 text-center"
                            style={{
                              backgroundColor: `hsl(var(--primary) / ${Math.abs(row.Humidity) * 0.3})`,
                            }}
                          >
                            {row.Humidity}
                          </td>
                          <td
                            className="border border-border p-2 text-center"
                            style={{
                              backgroundColor: `hsl(var(--primary) / ${Math.abs(row.River) * 0.3})`,
                            }}
                          >
                            {row.River}
                          </td>
                          <td
                            className="border border-border p-2 text-center"
                            style={{
                              backgroundColor: `hsl(var(--primary) / ${Math.abs(row.Water) * 0.3})`,
                            }}
                          >
                            {row.Water}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scatter" className="space-y-6">
            <Card className="bg-background/80 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle>Rainfall vs Humidity Scatter Plot</CardTitle>
                <CardDescription>
                  Relationship between rainfall and humidity (colored by flood occurrence)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="rainfall"
                      name="Rainfall"
                      unit="mm"
                      stroke="hsl(var(--foreground))"
                    />
                    <YAxis
                      dataKey="humidity"
                      name="Humidity"
                      unit="%"
                      stroke="hsl(var(--foreground))"
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Legend />
                    <Scatter
                      name="Flood"
                      data={scatter.filter(d => d.flood === 1)}
                      fill="hsl(var(--warning))"
                    />
                    <Scatter
                      name="No Flood"
                      data={scatter.filter(d => d.flood === 0)}
                      fill="hsl(var(--success))"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flood" className="space-y-6">
            <Card className="bg-background/80 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle>Flood Occurrence Distribution</CardTitle>
                <CardDescription>
                  Dataset balance: Flood vs Non-Flood cases
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row items-center gap-8">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={floodDist}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {floodDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Dataset Summary</h3>
                    <p className="text-sm text-muted-foreground">
                      Total samples: {data.length.toLocaleString()}
                    </p>
                  </div>
                  {floodDist.map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {item.value.toLocaleString()} samples (
                        {((item.value / data.length) * 100).toFixed(1)}%)
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Analytics;
