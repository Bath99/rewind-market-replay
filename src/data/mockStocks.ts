export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  market: 'NYSE' | 'NASDAQ';
}

export interface HistoricalDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export const mockStocks: Stock[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 189.95,
    change: 2.34,
    changePercent: 1.25,
    market: "NASDAQ"
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 415.26,
    change: -3.12,
    changePercent: -0.75,
    market: "NASDAQ"
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 139.69,
    change: 1.85,
    changePercent: 1.34,
    market: "NASDAQ"
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 248.42,
    change: -12.15,
    changePercent: -4.66,
    market: "NASDAQ"
  },
  {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    price: 178.32,
    change: 5.67,
    changePercent: 3.28,
    market: "NASDAQ"
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    price: 184.75,
    change: 2.18,
    changePercent: 1.19,
    market: "NYSE"
  },
  {
    symbol: "BAC",
    name: "Bank of America Corporation",
    price: 37.82,
    change: -0.45,
    changePercent: -1.17,
    market: "NYSE"
  },
  {
    symbol: "JNJ",
    name: "Johnson & Johnson",
    price: 155.89,
    change: 0.95,
    changePercent: 0.61,
    market: "NYSE"
  }
];

// Generate realistic OHLC candlestick data
export const generateHistoricalData = (symbol: string, startDate: Date, days: number = 1): HistoricalDataPoint[] => {
  const stock = mockStocks.find(s => s.symbol === symbol);
  if (!stock) return [];

  const data: HistoricalDataPoint[] = [];
  // Use more realistic historical price (10-30% lower than current)
  const historicalMultiplier = 0.7 + Math.random() * 0.2; // 70-90% of current price
  let currentPrice = stock.price * historicalMultiplier;
  
  // Start from the beginning of the selected date
  const startTimestamp = new Date(startDate).setHours(9, 30, 0, 0); // Market opens at 9:30 AM
  const endTimestamp = startTimestamp + (days * 6.5 * 60 * 60 * 1000); // 6.5 hours of trading
  
  let currentTimestamp = startTimestamp;
  
  while (currentTimestamp <= endTimestamp) {
    const date = new Date(currentTimestamp);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      currentTimestamp += 60000; // Add 1 minute
      continue;
    }
    
    // Skip after market hours (before 9:30 AM or after 4:00 PM)
    const hour = date.getHours();
    const minute = date.getMinutes();
    if (hour < 9 || (hour === 9 && minute < 30) || hour >= 16) {
      currentTimestamp += 60000; // Add 1 minute
      continue;
    }
    
    // Generate realistic OHLC data
    const open = currentPrice;
    
    // Generate price movements for the minute
    const volatility = 0.002 + Math.random() * 0.003; // 0.2-0.5% volatility per minute
    const trendBias = Math.sin(currentTimestamp / 20000000) * 0.001; // Very slight trend
    
    // Generate multiple price points within the minute to get high/low
    const pricePoints = [];
    let tempPrice = open;
    
    for (let i = 0; i < 4; i++) {
      const randomChange = (Math.random() - 0.5) * 2 * volatility + trendBias;
      tempPrice = tempPrice * (1 + randomChange);
      pricePoints.push(tempPrice);
    }
    
    const close = pricePoints[pricePoints.length - 1];
    const high = Math.max(open, ...pricePoints);
    const low = Math.min(open, ...pricePoints);
    
    // Generate volume data (higher volume during market open/close and on price movements)
    const marketMinute = (hour - 9) * 60 + minute - 30;
    const totalMarketMinutes = 6.5 * 60; // 6.5 hours
    const openCloseMultiplier = Math.max(0.3, 1 - Math.abs(marketMinute - totalMarketMinutes / 2) / totalMarketMinutes);
    const priceChangeMultiplier = 1 + Math.abs((close - open) / open) * 10; // Higher volume on big moves
    const baseVolume = 10000 + Math.random() * 50000;
    const volume = Math.floor(baseVolume * openCloseMultiplier * priceChangeMultiplier);
    
    data.push({
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      open: open,
      high: high,
      low: low,
      close: close,
      volume: volume,
      timestamp: currentTimestamp
    });
    
    currentPrice = close; // Update current price for next candle
    currentTimestamp += 60000; // Add 1 minute
  }
  
  return data;
};

// Aggregate 1-minute data into different timeframes
export const aggregateData = (data: HistoricalDataPoint[], timeframe: '1m' | '2m' | '5m' | '30m'): HistoricalDataPoint[] => {
  if (timeframe === '1m') return data;
  
  const intervalMinutes = timeframe === '2m' ? 2 : timeframe === '5m' ? 5 : 30;
  const aggregated: HistoricalDataPoint[] = [];
  
  for (let i = 0; i < data.length; i += intervalMinutes) {
    const chunk = data.slice(i, i + intervalMinutes);
    if (chunk.length === 0) continue;
    
    const open = chunk[0].open;
    const close = chunk[chunk.length - 1].close;
    const high = Math.max(...chunk.map(d => d.high));
    const low = Math.min(...chunk.map(d => d.low));
    const volume = chunk.reduce((sum, d) => sum + d.volume, 0);
    const timestamp = chunk[0].timestamp;
    
    aggregated.push({
      time: new Date(timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      open,
      high,
      low,
      close,
      volume,
      timestamp
    });
  }
  
  return aggregated;
};

export const getStockBySymbol = (symbol: string): Stock | undefined => {
  return mockStocks.find(stock => stock.symbol === symbol);
};