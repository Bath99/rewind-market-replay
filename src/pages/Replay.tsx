import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import StockChart from "@/components/StockChart";
import ReplayControls from "@/components/ReplayControls";
import { DatePicker } from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { mockStocks, getStockBySymbol } from "@/data/mockStocks";
import { fetchHistoricalData, convertToHistoricalDataPoint } from "@/services/alphaVantage";
import { useToast } from "@/hooks/use-toast";
import type { HistoricalDataPoint } from "@/data/mockStocks";

const Replay = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSymbol = searchParams.get("symbol") || "AAPL";
  const { toast } = useToast();
  
  const [selectedStock, setSelectedStock] = useState(initialSymbol);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [currentDataIndex, setCurrentDataIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [timeframe, setTimeframe] = useState<'1m' | '2m' | '5m' | '30m'>('1m');
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Map timeframes to Alpha Vantage intervals
  const getAlphaVantageInterval = (timeframe: string) => {
    switch (timeframe) {
      case '1m': return '1min';
      case '2m': return '1min'; // We'll aggregate 1min data
      case '5m': return '5min';
      case '30m': return '30min';
      default: return '1min';
    }
  };

  // Aggregate 1min data to 2min
  const aggregateToTwoMinute = (data: HistoricalDataPoint[]): HistoricalDataPoint[] => {
    const aggregated: HistoricalDataPoint[] = [];
    
    for (let i = 0; i < data.length; i += 2) {
      const current = data[i];
      const next = data[i + 1];
      
      if (!current) continue;
      
      const aggregatedPoint: HistoricalDataPoint = {
        time: current.time,
        open: current.open,
        high: next ? Math.max(current.high, next.high) : current.high,
        low: next ? Math.min(current.low, next.low) : current.low,
        close: next ? next.close : current.close,
        volume: current.volume + (next ? next.volume : 0),
        timestamp: current.timestamp
      };
      
      aggregated.push(aggregatedPoint);
    }
    
    return aggregated;
  };

  // Load historical data when stock, date, or timeframe changes
  useEffect(() => {
    const loadHistoricalData = async () => {
      setIsLoading(true);
      try {
        const month = selectedDate.toISOString().slice(0, 7); // YYYY-MM format
        const interval = getAlphaVantageInterval(timeframe);
        
        const alphaData = await fetchHistoricalData(selectedStock, interval as any, month);
        let convertedData = convertToHistoricalDataPoint(alphaData);
        
        // Filter data for the selected date
        const targetDate = selectedDate.toISOString().slice(0, 10);
        convertedData = convertedData.filter(point => {
          const pointDate = new Date(point.timestamp).toISOString().slice(0, 10);
          return pointDate === targetDate;
        });

        // Sort by timestamp (oldest first for replay)
        convertedData.sort((a, b) => a.timestamp - b.timestamp);

        // Aggregate to 2min if needed
        if (timeframe === '2m') {
          convertedData = aggregateToTwoMinute(convertedData);
        }

        setHistoricalData(convertedData);
        setCurrentDataIndex(0);
        setIsPlaying(false);

        if (convertedData.length === 0) {
          toast({
            title: "No Data Available",
            description: `No historical data found for ${selectedStock} on ${selectedDate.toLocaleDateString()}. Showing sample data.`,
            variant: "destructive"
          });
          
          // Fall back to sample data
          const sampleData: HistoricalDataPoint[] = Array.from({ length: 50 }, (_, i) => {
            const basePrice = 150 + Math.random() * 100;
            const time = new Date(selectedDate);
            time.setHours(9, 30 + i * (timeframe === '30m' ? 30 : timeframe === '5m' ? 5 : timeframe === '2m' ? 2 : 1), 0, 0);
            
            return {
              time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
              open: basePrice + (Math.random() - 0.5) * 2,
              high: basePrice + Math.random() * 3,
              low: basePrice - Math.random() * 3,
              close: basePrice + (Math.random() - 0.5) * 2,
              volume: Math.floor(100000 + Math.random() * 500000),
              timestamp: time.getTime()
            };
          });
          setHistoricalData(sampleData);
        }

      } catch (error) {
        console.error('Error loading historical data:', error);
        toast({
          title: "Data Load Error",
          description: "Failed to load historical data from Alpha Vantage. Showing sample data.",
          variant: "destructive"
        });
        
        // Fall back to sample data
        const sampleData: HistoricalDataPoint[] = Array.from({ length: 50 }, (_, i) => {
          const basePrice = 150 + Math.random() * 100;
          const time = new Date(selectedDate);
          time.setHours(9, 30 + i * (timeframe === '30m' ? 30 : timeframe === '5m' ? 5 : timeframe === '2m' ? 2 : 1), 0, 0);
          
          return {
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            open: basePrice + (Math.random() - 0.5) * 2,
            high: basePrice + Math.random() * 3,
            low: basePrice - Math.random() * 3,
            close: basePrice + (Math.random() - 0.5) * 2,
            volume: Math.floor(100000 + Math.random() * 500000),
            timestamp: time.getTime()
          };
        });
        setHistoricalData(sampleData);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistoricalData();
  }, [selectedStock, selectedDate, timeframe, toast]);

  // Handle URL parameter updates
  useEffect(() => {
    setSearchParams({ symbol: selectedStock });
  }, [selectedStock, setSearchParams]);

  // Replay functionality
  const startReplay = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }

    const newIntervalId = setInterval(() => {
      setCurrentDataIndex((prevIndex) => {
        if (prevIndex >= historicalData.length - 1) {
          setIsPlaying(false);
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, 1000 / speed);

    setIntervalId(newIntervalId);
  }, [speed, historicalData.length, intervalId]);

  const stopReplay = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);

  useEffect(() => {
    if (isPlaying) {
      startReplay();
    } else {
      stopReplay();
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, startReplay, stopReplay]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  const handleTimeChange = (newTime: number) => {
    setCurrentDataIndex(Math.min(newTime, historicalData.length - 1));
    setIsPlaying(false);
  };

  const handleTimeframeChange = (newTimeframe: '1m' | '2m' | '5m' | '30m') => {
    setTimeframe(newTimeframe);
  };

  const handleStockChange = (symbol: string) => {
    setSelectedStock(symbol);
  };

  // Get current data for display
  const currentData = historicalData.slice(0, currentDataIndex + 1);
  const currentPoint = historicalData[currentDataIndex];
  const previousPoint = historicalData[currentDataIndex - 1];
  const stock = getStockBySymbol(selectedStock);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading Historical Data...</h1>
            <p className="text-muted-foreground">Fetching {selectedStock} data from Alpha Vantage...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stock || !currentPoint) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Data Available</h1>
            <p className="text-muted-foreground">Please select a different date or stock symbol.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = currentPoint.close;
  const priceChange = previousPoint ? currentPoint.close - previousPoint.close : 0;
  const currentDate = new Date(currentPoint.timestamp).toLocaleDateString();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Stock Selection Header */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Stock Replay</h1>
            <p className="text-muted-foreground">
              Travel through time and watch historical stock movements unfold
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <DatePicker 
              date={selectedDate} 
              onDateChange={(date) => date && setSelectedDate(date)} 
            />
            
            <Select value={selectedStock} onValueChange={handleStockChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select a stock" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1 text-xs text-muted-foreground font-semibold">NYSE</div>
                {mockStocks.filter(s => s.market === 'NYSE').map((stock) => (
                  <SelectItem key={stock.symbol} value={stock.symbol}>
                    <div className="flex items-center justify-between w-full">
                      <span>{stock.symbol}</span>
                      <span className="text-xs text-muted-foreground ml-2">{stock.name}</span>
                    </div>
                  </SelectItem>
                ))}
                <div className="px-2 py-1 text-xs text-muted-foreground font-semibold border-t mt-1 pt-2">NASDAQ</div>
                {mockStocks.filter(s => s.market === 'NASDAQ').map((stock) => (
                  <SelectItem key={stock.symbol} value={stock.symbol}>
                    <div className="flex items-center justify-between w-full">
                      <span>{stock.symbol}</span>
                      <span className="text-xs text-muted-foreground ml-2">{stock.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Badge variant="outline" className="text-xs">
              {stock.market}
            </Badge>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chart - Takes most space */}
          <div className="lg:col-span-3">
            <StockChart
              data={currentData}
              symbol={selectedStock}
              currentPrice={currentPrice}
              change={priceChange}
              timeframe={timeframe}
              onTimeframeChange={handleTimeframeChange}
            />
          </div>

          {/* Stock Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{stock.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-2xl font-mono font-bold text-foreground">
                    ${currentPrice.toFixed(2)}
                  </div>
                  <div className={`text-sm font-mono ${priceChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} 
                    ({priceChange >= 0 ? '+' : ''}{((priceChange / currentPrice) * 100).toFixed(2)}%)
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">O:</span>
                      <span className="font-mono">${currentPoint.open.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">H:</span>
                      <span className="font-mono">${currentPoint.high.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">L:</span>
                      <span className="font-mono">${currentPoint.low.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">C:</span>
                      <span className="font-mono">${currentPoint.close.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volume:</span>
                    <span className="font-mono">{currentPoint.volume.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-mono">{currentPoint.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-mono">{currentDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Market Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Day's Range:</span>
                  <span className="font-mono">
                    ${Math.min(...currentData.map(d => d.low)).toFixed(2)} - 
                    ${Math.max(...currentData.map(d => d.high)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Volume:</span>
                  <span className="font-mono">
                    {Math.round(currentData.reduce((sum, d) => sum + d.volume, 0) / currentData.length).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timeframe:</span>
                  <span className="font-mono">{timeframe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data Points:</span>
                  <span className="font-mono">{currentDataIndex + 1} / {historicalData.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Replay Controls */}
        <div className="mt-8">
          <ReplayControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            speed={speed}
            onSpeedChange={handleSpeedChange}
            currentTime={currentDataIndex}
            totalTime={historicalData.length - 1}
            onTimeChange={handleTimeChange}
            currentDate={currentDate}
          />
        </div>
      </div>
    </div>
  );
};

export default Replay;