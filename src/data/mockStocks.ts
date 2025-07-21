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
  price: number;
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

// Generate mock historical data for replay functionality with custom start date
export const generateHistoricalData = (symbol: string, startDate: Date, days: number = 1): HistoricalDataPoint[] => {
  const stock = mockStocks.find(s => s.symbol === symbol);
  if (!stock) return [];

  const data: HistoricalDataPoint[] = [];
  const basePrice = stock.price;
  
  // Start from the beginning of the selected date
  const startTimestamp = new Date(startDate).setHours(9, 30, 0, 0); // Market opens at 9:30 AM
  const endTimestamp = startTimestamp + (days * 16 * 60 * 60 * 1000); // 16 hours of trading
  
  let currentTimestamp = startTimestamp;
  let currentPrice = basePrice * (0.95 + Math.random() * 0.1); // Start with slight variation
  
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
    
    // Generate realistic price movement
    const volatility = 0.003; // 0.3% volatility per minute
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const timeBasedTrend = Math.sin(currentTimestamp / 10000000) * 0.001; // Very slight trend
    
    currentPrice = currentPrice * (1 + randomChange + timeBasedTrend);
    
    // Generate volume data (higher volume during market open/close)
    const marketMinute = (hour - 9) * 60 + minute - 30;
    const totalMarketMinutes = 6.5 * 60; // 6.5 hours
    const volumeMultiplier = Math.max(0.3, 1 - Math.abs(marketMinute - totalMarketMinutes / 2) / totalMarketMinutes);
    const baseVolume = 50000 + Math.random() * 100000; // Random base volume
    const volume = Math.floor(baseVolume * volumeMultiplier);
    
    data.push({
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      price: currentPrice,
      volume: volume,
      timestamp: currentTimestamp
    });
    
    currentTimestamp += 60000; // Add 1 minute
  }
  
  return data;
};

export const getStockBySymbol = (symbol: string): Stock | undefined => {
  return mockStocks.find(stock => stock.symbol === symbol);
};