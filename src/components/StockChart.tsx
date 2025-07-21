import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  time: string;
  price: number;
  volume: number;
}

interface StockChartProps {
  data: ChartDataPoint[];
  symbol: string;
  currentPrice: number;
  change: number;
}

const StockChart = ({ data, symbol, currentPrice, change }: StockChartProps) => {
  const isPositive = change >= 0;
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-mono text-muted-foreground">{label}</p>
          <p className="text-sm font-mono text-foreground">
            Price: <span className="text-primary">${payload[0].value.toFixed(2)}</span>
          </p>
          {payload[0].payload.volume && (
            <p className="text-sm font-mono text-muted-foreground">
              Volume: {payload[0].payload.volume.toLocaleString()}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">{symbol}</CardTitle>
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-foreground">
              ${currentPrice.toFixed(2)}
            </div>
            <div className={`text-sm font-mono ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{((change / currentPrice) * 100).toFixed(2)}%)
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--chart-grid))" 
                opacity={0.3}
              />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={isPositive ? "hsl(var(--chart-positive))" : "hsl(var(--chart-negative))"} 
                strokeWidth={2}
                dot={false}
                activeDot={{ 
                  r: 6, 
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 2,
                  fill: "hsl(var(--background))"
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockChart;