import { useState, useCallback, useRef } from "react";

interface UseChartDragProps {
  totalDataLength: number;
  visibleDataRange: { start: number; end: number };
  onRangeChange: (start: number, end: number) => void;
  disabled?: boolean;
}

export const useChartDrag = ({
  totalDataLength,
  visibleDataRange,
  onRangeChange,
  disabled = false
}: UseChartDragProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [initialRange, setInitialRange] = useState({ start: 0, end: 0 });
  const dragThreshold = useRef(5); // Minimum pixels to start dragging

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStartX(e.clientX);
    setInitialRange(visibleDataRange);
  }, [visibleDataRange, disabled]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || disabled) return;

    const deltaX = e.clientX - dragStartX;
    
    // Only start panning after minimum threshold
    if (Math.abs(deltaX) < dragThreshold.current) return;

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
  }, [isDragging, dragStartX, visibleDataRange, totalDataLength, initialRange, onRangeChange, disabled]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    dragProps: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      style: { cursor: isDragging ? 'grabbing' : disabled ? 'default' : 'grab' }
    }
  };
};