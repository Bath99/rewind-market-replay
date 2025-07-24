import { useState, useCallback } from "react";

interface UseChartDragProps {
  totalDataLength: number;
  visibleDataRange: { start: number; end: number };
  onRangeChange: (start: number, end: number) => void;
}

export const useChartDrag = ({
  totalDataLength,
  visibleDataRange,
  onRangeChange
}: UseChartDragProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [initialRange, setInitialRange] = useState({ start: 0, end: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setInitialRange(visibleDataRange);
  }, [visibleDataRange]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartX;
    const chartWidth = e.currentTarget.getBoundingClientRect().width;
    const visibleLength = visibleDataRange.end - visibleDataRange.start;
    
    // Calculate how many data points to shift based on mouse movement
    const pointsPerPixel = visibleLength / chartWidth;
    const pointsShift = Math.round(deltaX * pointsPerPixel);
    
    let newStart = initialRange.start - pointsShift;
    let newEnd = initialRange.end - pointsShift;
    
    // Constrain to data bounds
    if (newStart < 0) {
      newStart = 0;
      newEnd = visibleLength;
    } else if (newEnd > totalDataLength) {
      newEnd = totalDataLength;
      newStart = totalDataLength - visibleLength;
    }
    
    onRangeChange(newStart, newEnd);
  }, [isDragging, dragStartX, visibleDataRange, totalDataLength, initialRange, onRangeChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
};