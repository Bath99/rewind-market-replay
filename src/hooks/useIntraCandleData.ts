import { useState, useEffect, useRef } from "react";

interface TickData {
  timestamp: Date;
  price: number;
  volume: number;
}

interface CandleData {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ticks?: TickData[];
}

export const useIntraCandleData = (candleData: CandleData[], currentTime: Date, timeframe: number = 1) => {
  const [intraTicks, setIntraTicks] = useState<TickData[]>([]);
  const tickInterval = useRef<NodeJS.Timeout>();

  // Generate realistic intra-candle tick data
  const generateTicksForCandle = (candle: CandleData): TickData[] => {
    const ticks: TickData[] = [];
    const ticksPerMinute = 60; // One tick per second
    const totalTicks = ticksPerMinute * timeframe;
    
    // Create realistic price movement within the candle
    const priceRange = candle.high - candle.low;
    const volumePerTick = candle.volume / totalTicks;
    
    for (let i = 0; i < totalTicks; i++) {
      const progress = i / (totalTicks - 1);
      const timestamp = new Date(candle.timestamp.getTime() + (i * 1000 * timeframe * 60 / totalTicks));
      
      // Create realistic price movement using sine wave + random walk
      let price: number;
      if (i === 0) {
        price = candle.open;
      } else if (i === totalTicks - 1) {
        price = candle.close;
      } else {
        // Blend between open and close with some realistic volatility
        const basePrice = candle.open + (candle.close - candle.open) * progress;
        const volatility = Math.sin(progress * Math.PI * 4) * (priceRange * 0.3) * Math.random();
        price = Math.max(candle.low, Math.min(candle.high, basePrice + volatility));
      }
      
      ticks.push({
        timestamp,
        price,
        volume: volumePerTick * (0.5 + Math.random()) // Vary volume per tick
      });
    }
    
    return ticks;
  };

  // Update ticks when candle data changes
  useEffect(() => {
    const currentCandle = candleData.find(candle => {
      const candleStart = candle.timestamp;
      const candleEnd = new Date(candleStart.getTime() + timeframe * 60 * 1000);
      return currentTime >= candleStart && currentTime < candleEnd;
    });

    if (currentCandle) {
      const ticks = generateTicksForCandle(currentCandle);
      const currentTicks = ticks.filter(tick => tick.timestamp <= currentTime);
      setIntraTicks(currentTicks);
    }
  }, [candleData, currentTime, timeframe]);

  // Get the current price based on tick data
  const getCurrentTickPrice = (): number => {
    if (intraTicks.length === 0) {
      const currentCandle = candleData.find(candle => {
        const candleStart = candle.timestamp;
        const candleEnd = new Date(candleStart.getTime() + timeframe * 60 * 1000);
        return currentTime >= candleStart && currentTime < candleEnd;
      });
      return currentCandle?.open || 0;
    }
    
    return intraTicks[intraTicks.length - 1]?.price || 0;
  };

  return {
    intraTicks,
    getCurrentTickPrice,
    hasIntraData: intraTicks.length > 0
  };
};