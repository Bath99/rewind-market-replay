import { useState, useEffect } from "react";

interface DrawingLine {
  id: string;
  type: 'trend' | 'horizontal';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  symbol: string;
  timeframe: string;
  chartId?: string; // Add chart ID for multi-chart support
}

export const useDrawingPersistence = (symbol: string, timeframe: string, chartId: string = 'primary', persistAcrossTimeframes: boolean = true) => {
  const [lines, setLines] = useState<DrawingLine[]>([]);

  // Load lines from localStorage when symbol or timeframe changes
  useEffect(() => {
    const storageKey = `drawing_lines_${symbol}_${chartId}`;
    const savedLines = localStorage.getItem(storageKey);
    
    if (savedLines) {
      const parsedLines: DrawingLine[] = JSON.parse(savedLines);
      let filteredLines;
      
      if (persistAcrossTimeframes) {
        // Show lines from all timeframes if persistence is enabled
        filteredLines = parsedLines.filter(line => 
          line.symbol === symbol && line.chartId === chartId
        );
      } else {
        // Only show lines for current timeframe
        filteredLines = parsedLines.filter(line => 
          line.symbol === symbol && line.timeframe === timeframe && line.chartId === chartId
        );
      }
      setLines(filteredLines);
    } else {
      setLines([]);
    }
  }, [symbol, timeframe, chartId, persistAcrossTimeframes]);

  // Save lines to localStorage whenever lines change
  useEffect(() => {
    if (lines.length === 0) return;
    
    const storageKey = `drawing_lines_${symbol}_${chartId}`;
    const allLines = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // Remove old lines for this symbol/timeframe/chartId and add current ones
    const otherLines = allLines.filter((line: DrawingLine) => 
      !(line.symbol === symbol && 
        (persistAcrossTimeframes ? line.chartId === chartId : (line.timeframe === timeframe && line.chartId === chartId)))
    );
    
    const updatedLines = [...otherLines, ...lines];
    localStorage.setItem(storageKey, JSON.stringify(updatedLines));
  }, [lines, symbol, timeframe, chartId, persistAcrossTimeframes]);

  const addLine = (line: Omit<DrawingLine, 'symbol' | 'timeframe' | 'chartId'>) => {
    const newLine: DrawingLine = {
      ...line,
      symbol,
      timeframe,
      chartId
    };
    setLines(prev => [...prev, newLine]);
  };

  const removeLine = (lineId: string) => {
    setLines(prev => prev.filter(line => line.id !== lineId));
  };

  const clearLines = () => {
    setLines([]);
    // Also clear from localStorage
    const storageKey = `drawing_lines_${symbol}_${chartId}`;
    localStorage.removeItem(storageKey);
  };

  const clearLinesForTimeframe = (targetTimeframe: string) => {
    setLines(prev => prev.filter(line => line.timeframe !== targetTimeframe));
  };

  return {
    lines,
    addLine,
    removeLine,
    clearLines,
    clearLinesForTimeframe
  };
};