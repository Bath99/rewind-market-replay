import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockChartProps {
  data: ChartDataPoint[];
  symbol: string;
  currentPrice: number;
  change: number;
  timeframe: '1m' | '2m' | '5m' | '30m';
  onTimeframeChange: (timeframe: '1m' | '2m' | '5m' | '30m') => void;
}

const StockChart = ({ data, symbol, currentPrice, change, timeframe, onTimeframeChange }: StockChartProps) => {
  const isPositive = change >= 0;
  
  const CustomCandlestick = (props: any) => {
    const { payload, x, y, width, height } = props;
    if (!payload) return null;
    
    const { open, high, low, close } = payload;
    const isGreen = close >= open;
    const color = isGreen ? 'hsl(var(--chart-positive))' : 'hsl(var(--chart-negative))';
    
    const bodyHeight = Math.abs(close - open) * height / (payload.high - payload.low);
    const bodyY = Math.min(open, close) * height / (payload.high - payload.low);
    const wickX = x + width / 2;
    
    return (
      <g>
        {/* High-Low wick */}
        <line
          x1={wickX}
          y1={y}
          x2={wickX}
          y2={y + height}
          stroke={color}
          strokeWidth={1}
        />
        {/* Open-Close body */}
        <rect
          x={x + width * 0.2}
          y={y + bodyY}
          width={width * 0.6}
          height={Math.max(bodyHeight, 1)}
          fill={isGreen ? color : 'transparent'}
          stroke={color}
          strokeWidth={1}
        />
      </g>
    );
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && payload[0].payload) {
      const data = payload[0].payload;
      const isGreen = data.close >= data.open;
      
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-mono text-muted-foreground">{label}</p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>O: <span className="text-primary">${data.open?.toFixed(2)}</span></div>
            <div>H: <span className="text-primary">${data.high?.toFixed(2)}</span></div>
            <div>L: <span className="text-primary">${data.low?.toFixed(2)}</span></div>
            <div>C: <span className={isGreen ? 'text-success' : 'text-destructive'}>${data.close?.toFixed(2)}</span></div>
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            Volume: {data.volume?.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  // Prepare data for chart with separate price and volume scales
  const maxVolume = Math.max(...data.map(d => d.volume));
  const chartData = data.map(d => ({
    ...d,
    volumeHeight: (d.volume / maxVolume) * 20, // Scale volume to 20% of chart height
  }));

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-xl font-bold">{symbol}</CardTitle>
            <Select value={timeframe} onValueChange={onTimeframeChange}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1m</SelectItem>
                <SelectItem value="2m">2m</SelectItem>
                <SelectItem value="5m">5m</SelectItem>
                <SelectItem value="30m">30m</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--chart-grid))" 
                opacity={0.3}
              />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                height={40}
              />
              <YAxis 
                yAxisId="price"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <YAxis 
                yAxisId="volume"
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, 'dataMax']}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Volume bars */}
              <Bar yAxisId="volume" dataKey="volume" opacity={0.3}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.close >= entry.open ? 'hsl(var(--chart-positive))' : 'hsl(var(--chart-negative))'} 
                  />
                ))}
              </Bar>
              
              {/* Custom candlesticks would need a custom component - for now using high-low lines */}
              {data.map((entry, index) => {
                const isGreen = entry.close >= entry.open;
                const color = isGreen ? 'hsl(var(--chart-positive))' : 'hsl(var(--chart-negative))';
                
                return (
                  <g key={index}>
                    {/* This is a simplified representation - in a real app you'd want a proper candlestick component */}
                  </g>
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockChart;