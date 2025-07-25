import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import DualChartView from "@/components/DualChartView";
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

const ReplayEnhanced = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSymbol = searchParams.get("symbol") || "AAPL";
  const { toast } = useToast();
  
  // Primary chart state
  const [primaryStock, setPrimaryStock] = useState(initialSymbol);
  const [primaryData, setPrimaryData] = useState<HistoricalDataPoint[]>([]);
  const [primaryTimeframe, setPrimaryTimeframe] = useState<'1m' | '2m' | '5m' | '30m'>('1m');
  
  // Secondary chart state
  const [secondaryStock, setSecondaryStock] = useState("TSLA");
  const [secondaryData, setSecondaryData] = useState<HistoricalDataPoint[]>([]);
  const [secondaryTimeframe, setSecondaryTimeframe] = useState<'1m' | '2m' | '5m' | '30m'>('2m');
  
  // Shared replay state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentDataIndex, setCurrentDataIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
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

  // Generate second-by-second price movement within each minute
  const generateSecondBySecondData = (data: HistoricalDataPoint[]): HistoricalDataPoint[] => {
    const detailedData: HistoricalDataPoint[] = [];
    
    data.forEach((point, index) => {
      const startTime = new Date(point.timestamp);
      const nextPoint = data[index + 1];
      
      // Generate 60 data points per minute (second by second)
      for (let second = 0; second < 60; second++) {
        const currentTime = new Date(startTime.getTime() + second * 1000);
        const progress = second / 60;
        
        // Interpolate price movement throughout the minute
        const priceRange = point.high - point.low;
        const volatility = priceRange * 0.1; // 10% of the range for intra-minute movement
        
        // Create realistic price movement with random walk
        const randomFactor = (Math.random() - 0.5) * volatility;
        const trendFactor = nextPoint ? (nextPoint.open - point.close) * progress * 0.3 : 0;
        
        const currentPrice = point.open + (point.close - point.open) * progress + randomFactor + trendFactor;
        
        detailedData.push({
          time: currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
          open: second === 0 ? point.open : detailedData[detailedData.length - 1]?.close || currentPrice,
          high: Math.max(currentPrice, point.high - (1 - progress) * priceRange * 0.3),
          low: Math.min(currentPrice, point.low + (1 - progress) * priceRange * 0.3),
          close: currentPrice,
          volume: Math.floor(point.volume / 60), // Distribute volume across seconds
          timestamp: currentTime.getTime()
        });
      }
    });
    
    return detailedData;
  };

  // Load data for a specific stock and timeframe
  const loadStockData = async (symbol: string, timeframe: string): Promise<HistoricalDataPoint[]> => {
    try {
      const month = selectedDate.toISOString().slice(0, 7);
      const interval = getAlphaVantageInterval(timeframe);
      
      const alphaData = await fetchHistoricalData(symbol, interval as any, month);
      let convertedData = convertToHistoricalDataPoint(alphaData);
      
      // Filter for selected date and include pre-market (4:00 AM - 9:30 AM)
      const targetDate = selectedDate.toISOString().slice(0, 10);
      convertedData = convertedData.filter(point => {
        const pointDate = new Date(point.timestamp).toISOString().slice(0, 10);
        const pointTime = new Date(point.timestamp);
        const hour = pointTime.getHours();
        const minute = pointTime.getMinutes();
        
        // Include pre-market (4:00 AM - 9:30 AM) and regular market hours
        return pointDate === targetDate && 
               ((hour >= 4 && hour < 9) || (hour === 9 && minute < 30) || (hour >= 9 && minute >= 30));
      });

      // Sort by timestamp (oldest first for replay)
      convertedData.sort((a, b) => a.timestamp - b.timestamp);

      // Aggregate to 2min if needed
      if (timeframe === '2m') {
        convertedData = aggregateToTwoMinute(convertedData);
      }

      // Generate detailed second-by-second data
      if (convertedData.length > 0) {
        convertedData = generateSecondBySecondData(convertedData);
      }

      if (convertedData.length === 0) {
        // Fall back to sample data with pre-market
        const sampleData: HistoricalDataPoint[] = [];
        const basePrice = 150 + Math.random() * 100;
        
        // Pre-market data (4:00 AM - 9:30 AM)
        for (let i = 0; i < 330; i++) { // 5.5 hours * 60 minutes
          const time = new Date(selectedDate);
          time.setHours(4, i, 0, 0);
          
          if (time.getHours() === 9 && time.getMinutes() >= 30) break;
          
          sampleData.push({
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            open: basePrice + (Math.random() - 0.5) * 2,
            high: basePrice + Math.random() * 3,
            low: basePrice - Math.random() * 3,
            close: basePrice + (Math.random() - 0.5) * 2,
            volume: Math.floor(50000 + Math.random() * 100000), // Lower pre-market volume
            timestamp: time.getTime()
          });
        }
        
        // Regular market hours starting at 9:30 AM
        for (let i = 0; i < 390; i++) { // 6.5 hours * 60 minutes
          const time = new Date(selectedDate);
          time.setHours(9, 30 + i, 0, 0);
          
          sampleData.push({
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            open: basePrice + (Math.random() - 0.5) * 2,
            high: basePrice + Math.random() * 3,
            low: basePrice - Math.random() * 3,
            close: basePrice + (Math.random() - 0.5) * 2,
            volume: Math.floor(100000 + Math.random() * 500000),
            timestamp: time.getTime()
          });
        }
        
        return generateSecondBySecondData(sampleData);
      }

      return convertedData;
    } catch (error) {
      console.error(`Error loading ${symbol} data:`, error);
      
      // Fall back to sample data with detailed structure
      const sampleData: HistoricalDataPoint[] = [];
      const basePrice = 150 + Math.random() * 100;
      
      for (let i = 0; i < 100; i++) {
        const time = new Date(selectedDate);
        time.setHours(9, 30 + i, 0, 0);
        
        sampleData.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          open: basePrice + (Math.random() - 0.5) * 2,
          high: basePrice + Math.random() * 3,
          low: basePrice - Math.random() * 3,
          close: basePrice + (Math.random() - 0.5) * 2,
          volume: Math.floor(100000 + Math.random() * 500000),
          timestamp: time.getTime()
        });
      }
      
      return generateSecondBySecondData(sampleData);
    }
  };

  // Load both charts data
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      const currentTimePercentage = primaryData.length > 0 ? currentDataIndex / primaryData.length : 0;
      
      try {
        const [primary, secondary] = await Promise.all([
          loadStockData(primaryStock, primaryTimeframe),
          loadStockData(secondaryStock, secondaryTimeframe)
        ]);

        setPrimaryData(primary);
        setSecondaryData(secondary);

        // Maintain timeline position
        const newIndex = Math.floor(currentTimePercentage * primary.length);
        setCurrentDataIndex(Math.min(newIndex, primary.length - 1));
        setIsPlaying(false);

      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Data Load Error",
          description: "Failed to load historical data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [primaryStock, secondaryStock, primaryTimeframe, secondaryTimeframe, selectedDate, toast]);

  // Handle URL parameter updates
  useEffect(() => {
    setSearchParams({ symbol: primaryStock });
  }, [primaryStock, setSearchParams]);

  // Replay functionality
  const startReplay = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }

    const newIntervalId = setInterval(() => {
      setCurrentDataIndex((prevIndex) => {
        const maxLength = Math.max(primaryData.length, secondaryData.length);
        if (prevIndex >= maxLength - 1) {
          setIsPlaying(false);
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, 1000 / speed);

    setIntervalId(newIntervalId);
  }, [speed, primaryData.length, secondaryData.length]);

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
  }, [isPlaying, speed]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  const handleTimeChange = (newTime: number) => {
    const maxLength = Math.max(primaryData.length, secondaryData.length);
    setCurrentDataIndex(Math.min(newTime, maxLength - 1));
    setIsPlaying(false);
  };

  // Get current data for display
  const primaryCurrentData = primaryData.slice(0, currentDataIndex + 1);
  const secondaryCurrentData = secondaryData.slice(0, currentDataIndex + 1);
  
  const primaryCurrentPoint = primaryData[currentDataIndex];
  const primaryPreviousPoint = primaryData[currentDataIndex - 1];
  
  const secondaryCurrentPoint = secondaryData[currentDataIndex];
  const secondaryPreviousPoint = secondaryData[currentDataIndex - 1];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading Historical Data...</h1>
            <p className="text-muted-foreground">Fetching data from Alpha Vantage...</p>
          </div>
        </div>
      </div>
    );
  }

  const maxDataLength = Math.max(primaryData.length, secondaryData.length);
  const currentDate = primaryCurrentPoint ? new Date(primaryCurrentPoint.timestamp).toLocaleDateString() : '';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Enhanced Stock Replay</h1>
            <p className="text-muted-foreground">
              Advanced replay with dual charts and trading simulation
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <DatePicker 
              date={selectedDate} 
              onDateChange={(date) => date && setSelectedDate(date)} 
            />
          </div>
        </div>

        {/* Charts */}
        <DualChartView
          primaryData={primaryCurrentData}
          primarySymbol={primaryStock}
          primaryPrice={primaryCurrentPoint?.close || 0}
          primaryChange={primaryPreviousPoint ? (primaryCurrentPoint?.close || 0) - primaryPreviousPoint.close : 0}
          primaryTimeframe={primaryTimeframe}
          onPrimaryTimeframeChange={setPrimaryTimeframe}
          onPrimaryStockChange={setPrimaryStock}
          availableStocks={mockStocks.map(s => ({ symbol: s.symbol, name: s.name }))}
          secondaryData={secondaryCurrentData}
          secondarySymbol={secondaryStock}
          secondaryPrice={secondaryCurrentPoint?.close || 0}
          secondaryChange={secondaryPreviousPoint ? (secondaryCurrentPoint?.close || 0) - secondaryPreviousPoint.close : 0}
          secondaryTimeframe={secondaryTimeframe}
          onSecondaryTimeframeChange={setSecondaryTimeframe}
          onSecondaryStockChange={setSecondaryStock}
        />

        {/* Replay Controls */}
        <div className="mt-8">
          <ReplayControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            speed={speed}
            onSpeedChange={handleSpeedChange}
            currentTime={currentDataIndex}
            totalTime={maxDataLength - 1}
            onTimeChange={handleTimeChange}
            currentDate={currentDate}
          />
        </div>
      </div>
    </div>
  );
};

export default ReplayEnhanced;