import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Minus, TrendingUp, ZoomIn, ZoomOut, Eraser, RotateCcw } from "lucide-react";

interface DrawingLine {
  id: string;
  type: 'trend' | 'horizontal';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
}

interface ChartDrawingToolsProps {
  chartContainerRef: React.RefObject<HTMLDivElement>;
  onZoomIn: () => void;
  onZoomOut: () => void;
  zoomLevel: number;
}

const ChartDrawingTools = ({ 
  chartContainerRef, 
  onZoomIn, 
  onZoomOut, 
  zoomLevel 
}: ChartDrawingToolsProps) => {
  const [activeTool, setActiveTool] = useState<'select' | 'trend' | 'horizontal'>('select');
  const [lines, setLines] = useState<DrawingLine[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<DrawingLine | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'select') return;
    
    const rect = chartContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newLine: DrawingLine = {
      id: Date.now().toString(),
      type: activeTool,
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      color: 'hsl(var(--primary))'
    };

    setCurrentLine(newLine);
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentLine) return;
    
    const rect = chartContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentLine({
      ...currentLine,
      endX: x,
      endY: activeTool === 'horizontal' ? currentLine.startY : y
    });
  };

  const handleMouseUp = () => {
    if (currentLine && isDrawing) {
      setLines(prev => [...prev, currentLine]);
      setCurrentLine(null);
    }
    setIsDrawing(false);
  };

  const clearLines = () => {
    setLines([]);
    setCurrentLine(null);
  };

  const allLines = currentLine ? [...lines, currentLine] : lines;

  return (
    <div className="absolute top-4 left-4 z-10 space-y-2">
      {/* Drawing Tools */}
      <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
        <div className="flex items-center space-x-1">
          <Button
            variant={activeTool === 'select' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('select')}
            className="h-8 w-8 p-0"
          >
            <span className="text-xs">↖</span>
          </Button>
          
          <Button
            variant={activeTool === 'trend' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('trend')}
            className="h-8 w-8 p-0"
          >
            <TrendingUp className="h-4 w-4" />
          </Button>
          
          <Button
            variant={activeTool === 'horizontal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTool('horizontal')}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={clearLines}
            className="h-8 w-8 p-0"
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomOut}
            disabled={zoomLevel <= 0.5}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Badge variant="outline" className="text-xs px-2 py-1">
            {Math.round(zoomLevel * 100)}%
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomIn}
            disabled={zoomLevel >= 3}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Drawing Overlay */}
      {chartContainerRef.current && (
        <svg
          ref={svgRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            pointerEvents: activeTool !== 'select' ? 'auto' : 'none'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {allLines.map((line) => (
            <line
              key={line.id}
              x1={line.startX}
              y1={line.startY}
              x2={line.endX}
              y2={line.endY}
              stroke={line.color}
              strokeWidth={2}
              strokeDasharray={line.type === 'horizontal' ? '5,5' : undefined}
            />
          ))}
        </svg>
      )}
    </div>
  );
};

export default ChartDrawingTools;