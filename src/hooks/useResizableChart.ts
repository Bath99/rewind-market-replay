import { useState, useCallback, useRef } from "react";

interface UseResizableChartProps {
  initialChartHeight?: number;
  initialVolumeHeight?: number;
  minChartHeight?: number;
  minVolumeHeight?: number;
}

export const useResizableChart = ({
  initialChartHeight = 400,
  initialVolumeHeight = 100,
  minChartHeight = 200,
  minVolumeHeight = 50
}: UseResizableChartProps = {}) => {
  const [chartHeight, setChartHeight] = useState(initialChartHeight);
  const [volumeHeight, setVolumeHeight] = useState(initialVolumeHeight);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartY = useRef(0);
  const initialHeights = useRef({ chart: 0, volume: 0 });

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartY.current = e.clientY;
    initialHeights.current = { chart: chartHeight, volume: volumeHeight };
  }, [chartHeight, volumeHeight]);

  const handleResizeMove = useCallback((e: React.MouseEvent) => {
    if (!isResizing) return;

    const deltaY = e.clientY - resizeStartY.current;
    const newChartHeight = Math.max(minChartHeight, initialHeights.current.chart + deltaY);
    const newVolumeHeight = Math.max(minVolumeHeight, initialHeights.current.volume - deltaY);
    
    setChartHeight(newChartHeight);
    setVolumeHeight(newVolumeHeight);
  }, [isResizing, minChartHeight, minVolumeHeight]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  return {
    chartHeight,
    volumeHeight,
    isResizing,
    resizeHandlers: {
      onMouseDown: handleResizeStart,
      onMouseMove: handleResizeMove,
      onMouseUp: handleResizeEnd,
      onMouseLeave: handleResizeEnd
    },
    resetSizes: () => {
      setChartHeight(initialChartHeight);
      setVolumeHeight(initialVolumeHeight);
    }
  };
};