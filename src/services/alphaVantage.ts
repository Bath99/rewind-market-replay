// Alpha Vantage API service for real historical stock data
const API_KEY = 'YS1TA13A2UCN2Q9G';
const BASE_URL = 'https://www.alphavantage.co/query';

export interface AlphaVantageDataPoint {
  timestamp: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export interface AlphaVantageResponse {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Interval': string;
    '5. Output Size': string;
    '6. Time Zone': string;
  };
  [key: string]: any; // Time series data
}

export const fetchHistoricalData = async (
  symbol: string,
  interval: '1min' | '5min' | '15min' | '30min',
  month?: string
): Promise<AlphaVantageDataPoint[]> => {
  try {
    const params = new URLSearchParams({
      function: 'TIME_SERIES_INTRADAY',
      symbol: symbol,
      interval: interval,
      outputsize: 'full',
      adjusted: 'false',
      extended_hours: 'false',
      datatype: 'json',
      apikey: API_KEY
    });

    if (month) {
      params.append('month', month);
    }

    const response = await fetch(`${BASE_URL}?${params}`);
    const data: AlphaVantageResponse = await response.json();

    // Check for API errors
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    if (data['Note']) {
      throw new Error('API call frequency limit reached. Please try again later.');
    }

    // Extract time series data
    const timeSeriesKey = Object.keys(data).find(key => key.startsWith('Time Series'));
    if (!timeSeriesKey || !data[timeSeriesKey]) {
      throw new Error('No time series data found in response');
    }

    const timeSeries = data[timeSeriesKey];
    
    // Convert to our format
    const result: AlphaVantageDataPoint[] = [];
    for (const [timestamp, values] of Object.entries(timeSeries)) {
      result.push({
        timestamp,
        open: values['1. open'],
        high: values['2. high'],
        low: values['3. low'],
        close: values['4. close'],
        volume: values['5. volume']
      });
    }

    // Sort by timestamp (most recent first)
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return result;
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    throw error;
  }
};

export const convertToHistoricalDataPoint = (
  alphaData: AlphaVantageDataPoint[]
): Array<{
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}> => {
  return alphaData.map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
    open: parseFloat(point.open),
    high: parseFloat(point.high),
    low: parseFloat(point.low),
    close: parseFloat(point.close),
    volume: parseInt(point.volume),
    timestamp: new Date(point.timestamp).getTime()
  }));
};