import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Position {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  timestamp: Date;
  pnl: number;
}

interface TradingInterfaceProps {
  symbol: string;
  currentPrice: number;
  onTrade?: (trade: Position) => void;
}

const TradingInterface = ({ symbol, currentPrice, onTrade }: TradingInterfaceProps) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [quantity, setQuantity] = useState(100);
  const [totalPnL, setTotalPnL] = useState(0);
  const [totalValue, setTotalValue] = useState(10000); // Starting with $10k
  const { toast } = useToast();

  // Load positions from localStorage
  useEffect(() => {
    const savedPositions = localStorage.getItem(`trading_positions_${symbol}`);
    const savedPnL = localStorage.getItem(`trading_pnl_${symbol}`);
    const savedValue = localStorage.getItem(`trading_value_${symbol}`);
    
    if (savedPositions) {
      const parsed = JSON.parse(savedPositions).map((p: any) => ({
        ...p,
        timestamp: new Date(p.timestamp)
      }));
      setPositions(parsed);
    }
    if (savedPnL) setTotalPnL(parseFloat(savedPnL));
    if (savedValue) setTotalValue(parseFloat(savedValue));
  }, [symbol]);

  // Save positions to localStorage
  useEffect(() => {
    localStorage.setItem(`trading_positions_${symbol}`, JSON.stringify(positions));
    localStorage.setItem(`trading_pnl_${symbol}`, totalPnL.toString());
    localStorage.setItem(`trading_value_${symbol}`, totalValue.toString());
  }, [positions, totalPnL, totalValue, symbol]);

  // Update PnL when current price changes
  useEffect(() => {
    const newTotalPnL = positions.reduce((total, position) => {
      const pnl = position.side === 'BUY' 
        ? (currentPrice - position.entryPrice) * position.quantity
        : (position.entryPrice - currentPrice) * position.quantity;
      return total + pnl;
    }, 0);
    setTotalPnL(newTotalPnL);
  }, [currentPrice, positions]);

  // Clear data every 24 hours
  useEffect(() => {
    const lastReset = localStorage.getItem('last_trading_reset');
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (!lastReset || new Date(lastReset) < oneDayAgo) {
      setPositions([]);
      setTotalPnL(0);
      setTotalValue(10000);
      localStorage.setItem('last_trading_reset', now.toISOString());
      localStorage.removeItem(`trading_positions_${symbol}`);
      localStorage.removeItem(`trading_pnl_${symbol}`);
      localStorage.removeItem(`trading_value_${symbol}`);
    }
  }, [symbol]);

  const handleTrade = (side: 'BUY' | 'SELL') => {
    const tradeValue = quantity * currentPrice;
    
    // Check if we have enough funds for buying
    if (side === 'BUY' && tradeValue > totalValue) {
      toast({
        title: "Insufficient Funds",
        description: `You need $${tradeValue.toFixed(2)} but only have $${totalValue.toFixed(2)}`,
        variant: "destructive"
      });
      return;
    }

    const newPosition: Position = {
      id: Date.now().toString(),
      symbol,
      side,
      quantity,
      entryPrice: currentPrice,
      currentPrice,
      timestamp: new Date(),
      pnl: 0
    };

    setPositions(prev => [...prev, newPosition]);
    
    // Update total value
    if (side === 'BUY') {
      setTotalValue(prev => prev - tradeValue);
    } else {
      setTotalValue(prev => prev + tradeValue);
    }

    onTrade?.(newPosition);

    toast({
      title: "Trade Executed",
      description: `${side} ${quantity} shares of ${symbol} at $${currentPrice.toFixed(2)}`,
    });
  };

  const closePosition = (positionId: string) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return;

    const pnl = position.side === 'BUY' 
      ? (currentPrice - position.entryPrice) * position.quantity
      : (position.entryPrice - currentPrice) * position.quantity;

    const closeValue = position.quantity * currentPrice;
    
    if (position.side === 'BUY') {
      setTotalValue(prev => prev + closeValue);
    } else {
      setTotalValue(prev => prev - closeValue);
    }

    setPositions(prev => prev.filter(p => p.id !== positionId));

    toast({
      title: "Position Closed",
      description: `Closed ${position.side} position with ${pnl >= 0 ? 'profit' : 'loss'} of $${Math.abs(pnl).toFixed(2)}`,
      variant: pnl >= 0 ? "default" : "destructive"
    });
  };

  const getPositionPnL = (position: Position) => {
    return position.side === 'BUY' 
      ? (currentPrice - position.entryPrice) * position.quantity
      : (position.entryPrice - currentPrice) * position.quantity;
  };

  return (
    <div className="space-y-4">
      {/* Trading Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trading Panel - {symbol}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Account Value:</span>
              <div className="font-mono font-bold">${(totalValue + totalPnL).toFixed(2)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Unrealized P&L:</span>
              <div className={`font-mono font-bold ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                ${totalPnL.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              placeholder="Quantity"
              className="w-24"
              min="1"
            />
            <span className="text-sm text-muted-foreground">shares at ${currentPrice.toFixed(2)}</span>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => handleTrade('BUY')} 
              className="flex-1 bg-success hover:bg-success/90"
            >
              BUY ${(quantity * currentPrice).toFixed(2)}
            </Button>
            <Button 
              onClick={() => handleTrade('SELL')} 
              variant="destructive"
              className="flex-1"
            >
              SELL ${(quantity * currentPrice).toFixed(2)}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Positions */}
      {positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Open Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {positions.map((position) => {
                const pnl = getPositionPnL(position);
                return (
                  <div key={position.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant={position.side === 'BUY' ? 'default' : 'destructive'}>
                        {position.side}
                      </Badge>
                      <span className="font-mono text-sm">
                        {position.quantity} @ ${position.entryPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-sm ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                        ${pnl.toFixed(2)}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => closePosition(position.id)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TradingInterface;