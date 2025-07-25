import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ChartDrawingTools from "./ChartDrawingTools";
import { useChartDrag } from "@/hooks/useChartDrag";

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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [visibleDataRange, setVisibleDataRange] = useState({ start: 0, end: Math.max(data.length, 1) });
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Chart drag functionality
  const { isDragging, handleMouseDown, handleMouseMove, handleMouseUp } = useChartDrag({
    totalDataLength: data.length,
    visibleDataRange,
    onRangeChange: (start, end) => setVisibleDataRange({ start, end })
  });

  // Update visible range when data changes
  useEffect(() => {
    setVisibleDataRange({ start: 0, end: Math.max(data.length, 1) });
  }, [data.length]);
  
  const CustomCandlestick = (props: any) => {
    const { payload, x, y, width, height } = props;
    if (!payload || !payload.open || !payload.high || !payload.low || !payload.close) return null;
    
    const { open, high, low, close } = payload;
    const isGreen = close >= open;
    const color = isGreen ? 'hsl(var(--chart-positive))' : 'hsl(var(--chart-negative))';
    
    // Scale values to pixel positions
    const yScale = height / (high - low);
    const highY = y;
    const lowY = y + height;
    const openY = y + (high - open) * yScale;
    const closeY = y + (high - close) * yScale;
    
    const bodyTop = Math.min(openY, closeY);
    const bodyHeight = Math.abs(openY - closeY);
    const wickX = x + width / 2;
    
    return (
      <g>
        {/* High-Low wick */}
        <line
          x1={wickX}
          y1={highY}
          x2={wickX}
          y2={lowY}
          stroke={color}
          strokeWidth={1}
        />
        {/* Open-Close body */}
        <rect
          x={x + width * 0.2}
          y={bodyTop}
          width={width * 0.6}
          height={Math.max(bodyHeight, 1)}
          fill={isGreen ? color : 'transparent'}
          stroke={color}
          strokeWidth={1}
        />
      </g>
    );
  };
  
  const CandlestickChart = (props: any) => {
    const { payload } = props;
    if (!payload || payload.length === 0) return null;
    
    return (
      <g>
        {visibleData.map((entry, index) => {
          const barWidth = 8; // Fixed width for candlesticks
          const x = (index * (props.width / visibleData.length)) + (props.width / visibleData.length - barWidth) / 2;
          
          const isGreen = entry.close >= entry.open;
          const color = isGreen ? 'hsl(var(--chart-positive))' : 'hsl(var(--chart-negative))';
          
          // Calculate price range for scaling
          const priceRange = Math.max(...visibleData.map(d => d.high)) - Math.min(...visibleData.map(d => d.low));
          const minPrice = Math.min(...visibleData.map(d => d.low));
          
          // Scale to chart height (leave space for volume bars at bottom)
          const chartHeight = props.height * 0.7; // 70% for price, 30% for volume
          const yScale = chartHeight / priceRange;
          
          const highY = props.y + (Math.max(...visibleData.map(d => d.high)) - entry.high) * yScale;
          const lowY = props.y + (Math.max(...visibleData.map(d => d.high)) - entry.low) * yScale;
          const openY = props.y + (Math.max(...visibleData.map(d => d.high)) - entry.open) * yScale;
          const closeY = props.y + (Math.max(...visibleData.map(d => d.high)) - entry.close) * yScale;
          
          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.abs(openY - closeY);
          const wickX = x + barWidth / 2;
          
          return (
            <g key={index}>
              {/* High-Low wick */}
              <line
                x1={wickX}
                y1={highY}
                x2={wickX}
                y2={lowY}
                stroke={color}
                strokeWidth={1}
              />
              {/* Open-Close body */}
              <rect
                x={x}
                y={bodyTop}
                width={barWidth}
                height={Math.max(bodyHeight, 1)}
                fill={isGreen ? color : 'transparent'}
                stroke={color}
                strokeWidth={1}
              />
            </g>
          );
        })}
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

  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-muted-foreground">
            No chart data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle zoom functionality
  const handleZoomIn = () => {
    if (zoomLevel < 3) {
      const newZoomLevel = Math.min(zoomLevel * 1.5, 3);
      setZoomLevel(newZoomLevel);
      updateVisibleRange(newZoomLevel);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 0.5) {
      const newZoomLevel = Math.max(zoomLevel / 1.5, 0.5);
      setZoomLevel(newZoomLevel);
      updateVisibleRange(newZoomLevel);
    }
  };

  const updateVisibleRange = (zoom: number) => {
    const totalPoints = data.length;
    const visiblePoints = Math.max(Math.floor(totalPoints / zoom), 10);
    const centerPoint = Math.floor(totalPoints * 0.8); // Show recent data
    const start = Math.max(0, centerPoint - Math.floor(visiblePoints / 2));
    const end = Math.min(totalPoints, start + visiblePoints);
    setVisibleDataRange({ start, end });
  };

  // Get visible data based on zoom level
  const visibleData = data.slice(visibleDataRange.start, visibleDataRange.end);
  
  // Prepare data for volume chart
  const maxVolume = Math.max(...visibleData.map(d => d.volume));
  const chartData = visibleData.map((d, index) => ({
    ...d,
    index,
    volumeHeight: (d.volume / maxVolume) * 100, // Percentage of max volume
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
        <div 
          ref={chartContainerRef} 
          className="h-96 w-full relative resize-y min-h-64 max-h-[800px] overflow-hidden"
        >
          {/* Chart drag overlay - only active when not using drawing tools */}
          <div 
            className={`absolute inset-0 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} z-10`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ pointerEvents: 'auto' }}
          />
          <ChartDrawingTools
            chartContainerRef={chartContainerRef}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            zoomLevel={zoomLevel}
            symbol={symbol}
            timeframe={timeframe}
            chartId="main"
          />
          {/* Price Chart with Candlesticks */}
          <div className="h-3/4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                  height={20}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Custom candlesticks overlay */}
                <Bar 
                  dataKey="close" 
                  shape={(props: any) => {
                    const { payload, x, y, width, height } = props;
                    if (!payload) return null;
                    
                    const isGreen = payload.close >= payload.open;
                    const color = isGreen ? 'hsl(var(--chart-positive))' : 'hsl(var(--chart-negative))';
                    
                    // Calculate positions for candlestick
                    const chartMax = Math.max(...chartData.map(d => d.high));
                    const chartMin = Math.min(...chartData.map(d => d.low));
                    const priceRange = chartMax - chartMin;
                    const yScale = height / priceRange;
                    
                    const highY = y - ((payload.high - chartMax) * yScale);
                    const lowY = y - ((payload.low - chartMax) * yScale);
                    const openY = y - ((payload.open - chartMax) * yScale);
                    const closeY = y - ((payload.close - chartMax) * yScale);
                    
                    const bodyTop = Math.min(openY, closeY);
                    const bodyHeight = Math.max(Math.abs(openY - closeY), 1);
                    const wickX = x + width / 2;
                    const bodyWidth = Math.max(width * 0.6, 2);
                    const bodyX = x + (width - bodyWidth) / 2;
                    
                    return (
                      <g>
                        {/* High-Low wick */}
                        <line
                          x1={wickX}
                          y1={highY}
                          x2={wickX}
                          y2={lowY}
                          stroke={color}
                          strokeWidth={1}
                        />
                        {/* Open-Close body */}
                        <rect
                          x={bodyX}
                          y={bodyTop}
                          width={bodyWidth}
                          height={bodyHeight}
                          fill={isGreen ? color : 'transparent'}
                          stroke={color}
                          strokeWidth={1}
                        />
                      </g>
                    );
                  }}
                  fillOpacity={0}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          {/* Volume Chart */}
          <div className="h-1/4 w-full border-t border-border">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--chart-grid))" 
                  opacity={0.2}
                />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={8}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={8}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                
                {/* Volume bars */}
                <Bar dataKey="volume" opacity={0.6}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.close >= entry.open ? 'hsl(var(--chart-positive))' : 'hsl(var(--chart-negative))'} 
                    />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockChart;