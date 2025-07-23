import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Rewind, FastForward } from "lucide-react";

interface ReplayControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  currentTime: number;
  totalTime: number;
  onTimeChange: (time: number) => void;
  currentDate: string;
}

const ReplayControls = ({
  isPlaying,
  onPlayPause,
  speed,
  onSpeedChange,
  currentTime,
  totalTime,
  onTimeChange,
  currentDate
}: ReplayControlsProps) => {
  const speedOptions = [0.5, 1, 2, 4, 8];
  
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTimeChange(0)}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSpeedChange(Math.max(0.5, speed / 2))}
          >
            <Rewind className="h-4 w-4" />
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={onPlayPause}
            className="bg-primary hover:bg-primary/90"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSpeedChange(Math.min(8, speed * 2))}
          >
            <FastForward className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTimeChange(totalTime)}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">Speed:</span>
          <div className="flex space-x-1">
            {speedOptions.map((option) => (
              <Button
                key={option}
                variant={speed === option ? "default" : "outline"}
                size="sm"
                onClick={() => onSpeedChange(option)}
                className="w-12 h-8 text-xs"
              >
                {option}x
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Timeline</span>
          <span className="font-mono">{currentDate}</span>
        </div>
        <Slider
          value={[currentTime]}
          onValueChange={(value) => onTimeChange(value[0])}
          max={totalTime}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground font-mono">
          <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</span>
          <span>{Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  );
};

export default ReplayControls;