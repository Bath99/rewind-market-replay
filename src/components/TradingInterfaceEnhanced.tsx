import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Trade {
  id: string;
  symbol: string;
  entryPrice: number;
  quantity: number;
  side: 'BUY' | 'SELL';
  netQuantity: number; // Can be positive (long) or negative (short)
  totalCost: number;
  timestamp: Date;
  pnl: number;
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: Date;
}

interface TradingInterfaceEnhancedProps {
  symbol: string;
  currentPrice: number;
  chartId: string; // 'primary' or 'secondary'
  onTrade?: (trade: Trade) => void;
}

const TradingInterfaceEnhanced = ({ symbol, currentPrice, chartId, onTrade }: TradingInterfaceEnhancedProps) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [quantity, setQuantity] = useState(100);
  const [totalPnL, setTotalPnL] = useState(0);
  const [totalValue, setTotalValue] = useState(10000); // Starting with $10k per chart
  const { toast } = useToast();

  // Load trades from localStorage
  useEffect(() => {
    const savedTrades = localStorage.getItem(`trading_trades_${symbol}_${chartId}`);
    const savedPnL = localStorage.getItem(`trading_pnl_${symbol}_${chartId}`);
    const savedValue = localStorage.getItem(`trading_value_${symbol}_${chartId}`);
    
    if (savedTrades) {
      const parsed = JSON.parse(savedTrades).map((t: any) => ({
        ...t,
        timestamp: new Date(t.timestamp),
        transactions: t.transactions.map((tx: any) => ({
          ...tx,
          timestamp: new Date(tx.timestamp)
        }))
      }));
      setTrades(parsed);
    }
    if (savedPnL) setTotalPnL(parseFloat(savedPnL));
    if (savedValue) setTotalValue(parseFloat(savedValue));
  }, [symbol, chartId]);

  // Save trades to localStorage
  useEffect(() => {
    localStorage.setItem(`trading_trades_${symbol}_${chartId}`, JSON.stringify(trades));
    localStorage.setItem(`trading_pnl_${symbol}_${chartId}`, totalPnL.toString());
    localStorage.setItem(`trading_value_${symbol}_${chartId}`, totalValue.toString());
  }, [trades, totalPnL, totalValue, symbol, chartId]);

  // Update PnL when current price changes
  useEffect(() => {
    const newTotalPnL = trades.reduce((total, trade) => {
      if (trade.netQuantity === 0) return total + trade.pnl; // Closed position
      
      // Calculate unrealized PnL for open positions
      const unrealizedPnL = trade.netQuantity > 0 
        ? (currentPrice - trade.entryPrice) * Math.abs(trade.netQuantity)
        : (trade.entryPrice - currentPrice) * Math.abs(trade.netQuantity);
      
      return total + trade.pnl + unrealizedPnL;
    }, 0);
    setTotalPnL(newTotalPnL);
  }, [currentPrice, trades]);

  // Clear data every 24 hours
  useEffect(() => {
    const lastReset = localStorage.getItem(`last_trading_reset_${chartId}`);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (!lastReset || new Date(lastReset) < oneDayAgo) {
      setTrades([]);
      setTotalPnL(0);
      setTotalValue(10000);
      localStorage.setItem(`last_trading_reset_${chartId}`, now.toISOString());
      localStorage.removeItem(`trading_trades_${symbol}_${chartId}`);
      localStorage.removeItem(`trading_pnl_${symbol}_${chartId}`);
      localStorage.removeItem(`trading_value_${symbol}_${chartId}`);
    }
  }, [symbol, chartId]);

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

    // Find existing trade for this symbol or create new one
    let existingTradeIndex = trades.findIndex(t => t.symbol === symbol && t.netQuantity !== 0);
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      side,
      quantity,
      price: currentPrice,
      timestamp: new Date()
    };

    if (existingTradeIndex >= 0) {
      // Add to existing trade
      const existingTrade = trades[existingTradeIndex];
      const newQuantityChange = side === 'BUY' ? quantity : -quantity;
      const newNetQuantity = existingTrade.netQuantity + newQuantityChange;
      
      // Calculate new average entry price for the position
      let newEntryPrice = existingTrade.entryPrice;
      let newTotalCost = existingTrade.totalCost;
      let realizedPnL = 0;
      
      if (Math.sign(newQuantityChange) === Math.sign(existingTrade.netQuantity) || existingTrade.netQuantity === 0) {
        // Adding to position or opening new position
        newTotalCost += tradeValue * (side === 'BUY' ? 1 : -1);
        if (newNetQuantity !== 0) {
          newEntryPrice = Math.abs(newTotalCost) / Math.abs(newNetQuantity);
        }
      } else {
        // Reducing position - calculate realized P&L
        const closingQuantity = Math.min(quantity, Math.abs(existingTrade.netQuantity));
        if (existingTrade.netQuantity > 0) {
          realizedPnL = (currentPrice - existingTrade.entryPrice) * closingQuantity;
        } else {
          realizedPnL = (existingTrade.entryPrice - currentPrice) * closingQuantity;
        }
        
        if (Math.abs(newNetQuantity) < Math.abs(existingTrade.netQuantity)) {
          // Partial close - keep same entry price
          newTotalCost = newEntryPrice * newNetQuantity * (newNetQuantity > 0 ? 1 : -1);
        }
      }

      const updatedTrade: Trade = {
        ...existingTrade,
        netQuantity: newNetQuantity,
        entryPrice: newEntryPrice,
        totalCost: newTotalCost,
        pnl: existingTrade.pnl + realizedPnL,
        transactions: [...existingTrade.transactions, newTransaction]
      };

      const newTrades = [...trades];
      newTrades[existingTradeIndex] = updatedTrade;
      setTrades(newTrades);
      
      // Update total value with realized P&L
      if (side === 'BUY') {
        setTotalValue(prev => prev - tradeValue + realizedPnL);
      } else {
        setTotalValue(prev => prev + tradeValue + realizedPnL);
      }
      
      onTrade?.(updatedTrade);
    } else {
      // Create new trade
      const newTrade: Trade = {
        id: Date.now().toString(),
        symbol,
        entryPrice: currentPrice,
        quantity,
        side,
        netQuantity: side === 'BUY' ? quantity : -quantity,
        totalCost: side === 'BUY' ? tradeValue : -tradeValue,
        timestamp: new Date(),
        pnl: 0,
        transactions: [newTransaction]
      };

      setTrades(prev => [...prev, newTrade]);
      
      // Update total value
      if (side === 'BUY') {
        setTotalValue(prev => prev - tradeValue);
      } else {
        setTotalValue(prev => prev + tradeValue);
      }

      onTrade?.(newTrade);
    }

    toast({
      title: "Trade Executed",
      description: `${side} ${quantity} shares of ${symbol} at $${currentPrice.toFixed(2)}`,
    });
  };

  const closeTrade = (tradeId: string) => {
    const trade = trades.find(t => t.id === tradeId);
    if (!trade || trade.netQuantity === 0) return;

    const side = trade.netQuantity > 0 ? 'SELL' : 'BUY';
    const quantity = Math.abs(trade.netQuantity);
    
    // Calculate final P&L
    const finalPnL = trade.netQuantity > 0 
      ? (currentPrice - trade.entryPrice) * quantity
      : (trade.entryPrice - currentPrice) * quantity;

    const closeValue = quantity * currentPrice;
    
    if (trade.netQuantity > 0) {
      setTotalValue(prev => prev + closeValue);
    } else {
      setTotalValue(prev => prev - closeValue);
    }

    // Close the trade
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      side,
      quantity,
      price: currentPrice,
      timestamp: new Date()
    };

    const updatedTrade: Trade = {
      ...trade,
      netQuantity: 0,
      pnl: trade.pnl + finalPnL,
      transactions: [...trade.transactions, newTransaction]
    };

    setTrades(prev => prev.map(t => t.id === tradeId ? updatedTrade : t));

    toast({
      title: "Trade Closed",
      description: `Closed ${trade.side} position with ${finalPnL >= 0 ? 'profit' : 'loss'} of $${Math.abs(finalPnL).toFixed(2)}`,
      variant: finalPnL >= 0 ? "default" : "destructive"
    });
  };

  const getTradeUnrealizedPnL = (trade: Trade) => {
    if (trade.netQuantity === 0) return trade.pnl; // Closed position
    
    const unrealizedPnL = trade.netQuantity > 0 
      ? (currentPrice - trade.entryPrice) * Math.abs(trade.netQuantity)
      : (trade.entryPrice - currentPrice) * Math.abs(trade.netQuantity);
    
    return trade.pnl + unrealizedPnL;
  };

  const openTrades = trades.filter(t => t.netQuantity !== 0);
  const closedTrades = trades.filter(t => t.netQuantity === 0);

  return (
    <div className="space-y-4">
      {/* Trading Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Trading Panel - {symbol} ({chartId === 'primary' ? 'Chart 1' : 'Chart 2'})
          </CardTitle>
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

      {/* Open Trades */}
      {openTrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Open Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {openTrades.map((trade) => {
                const totalPnL = getTradeUnrealizedPnL(trade);
                return (
                  <div key={trade.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant={trade.netQuantity > 0 ? 'default' : 'destructive'}>
                        {trade.netQuantity > 0 ? 'LONG' : 'SHORT'}
                      </Badge>
                      <span className="font-mono text-sm">
                        {Math.abs(trade.netQuantity)} @ ${trade.entryPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({trade.transactions.length} transactions)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-sm ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                        ${totalPnL.toFixed(2)}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => closeTrade(trade.id)}
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

      {/* Closed Trades */}
      {closedTrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Closed Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {closedTrades.slice(-5).map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">CLOSED</Badge>
                    <span className="font-mono text-sm">
                      {trade.transactions.length} transactions
                    </span>
                  </div>
                  <span className={`font-mono text-sm ${trade.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ${trade.pnl.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TradingInterfaceEnhanced;
