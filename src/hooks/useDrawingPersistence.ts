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
}

export const useDrawingPersistence = (symbol: string, timeframe: string) => {
  const [lines, setLines] = useState<DrawingLine[]>([]);

  // Load lines from localStorage when symbol or timeframe changes
  useEffect(() => {
    const storageKey = `drawing_lines_${symbol}`;
    const savedLines = localStorage.getItem(storageKey);
    
    if (savedLines) {
      const parsedLines: DrawingLine[] = JSON.parse(savedLines);
      // Filter lines for the current timeframe
      const filteredLines = parsedLines.filter(line => 
        line.symbol === symbol && line.timeframe === timeframe
      );
      setLines(filteredLines);
    } else {
      setLines([]);
    }
  }, [symbol, timeframe]);

  // Save lines to localStorage whenever lines change
  useEffect(() => {
    const storageKey = `drawing_lines_${symbol}`;
    const allLines = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // Remove old lines for this symbol/timeframe and add current ones
    const otherLines = allLines.filter((line: DrawingLine) => 
      !(line.symbol === symbol && line.timeframe === timeframe)
    );
    
    const updatedLines = [...otherLines, ...lines];
    localStorage.setItem(storageKey, JSON.stringify(updatedLines));
  }, [lines, symbol, timeframe]);

  const addLine = (line: Omit<DrawingLine, 'symbol' | 'timeframe'>) => {
    const newLine: DrawingLine = {
      ...line,
      symbol,
      timeframe
    };
    setLines(prev => [...prev, newLine]);
  };

  const removeLine = (lineId: string) => {
    setLines(prev => prev.filter(line => line.id !== lineId));
  };

  const clearLines = () => {
    setLines([]);
  };

  return {
    lines,
    addLine,
    removeLine,
    clearLines
  };
};