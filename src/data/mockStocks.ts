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
    price: 175.43,
    change: 2.34,
    changePercent: 1.35,
    market: "NASDAQ"
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 378.85,
    change: -1.23,
    changePercent: -0.32,
    market: "NASDAQ"
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 142.56,
    change: 3.45,
    changePercent: 2.48,
    market: "NASDAQ"
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 238.77,
    change: -8.32,
    changePercent: -3.37,
    market: "NASDAQ"
  },
  {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    price: 152.74,
    change: 4.21,
    changePercent: 2.84,
    market: "NASDAQ"
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    price: 165.89,
    change: 1.56,
    changePercent: 0.95,
    market: "NYSE"
  },
  {
    symbol: "BAC",
    name: "Bank of America Corporation",
    price: 33.45,
    change: -0.23,
    changePercent: -0.68,
    market: "NYSE"
  },
  {
    symbol: "JNJ",
    name: "Johnson & Johnson",
    price: 158.23,
    change: 0.87,
    changePercent: 0.55,
    market: "NYSE"
  }
];

// Generate mock historical data for replay functionality
export const generateHistoricalData = (symbol: string, days: number = 30): HistoricalDataPoint[] => {
  const stock = mockStocks.find(s => s.symbol === symbol);
  if (!stock) return [];

  const data: HistoricalDataPoint[] = [];
  const basePrice = stock.price;
  const now = new Date();
  
  for (let i = days * 24 * 60; i >= 0; i -= 5) { // Every 5 minutes
    const timestamp = now.getTime() - (i * 60000);
    const date = new Date(timestamp);
    
    // Generate realistic price movement
    const volatility = 0.02; // 2% volatility
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const trend = Math.sin(i / 1000) * 0.01; // Long-term trend
    
    const previousPrice = data.length > 0 ? data[data.length - 1].price : basePrice;
    const newPrice = previousPrice * (1 + randomChange + trend);
    
    // Generate volume data
    const baseVolume = 1000000;
    const volumeVariation = Math.random() * 0.5 + 0.5; // 50-150% of base volume
    const volume = Math.floor(baseVolume * volumeVariation);
    
    data.push({
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      price: newPrice,
      volume: volume,
      timestamp: timestamp
    });
  }
  
  return data.reverse(); // Reverse to have chronological order
};

export const getStockBySymbol = (symbol: string): Stock | undefined => {
  return mockStocks.find(stock => stock.symbol === symbol);
};