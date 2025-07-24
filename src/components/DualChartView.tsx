import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Grid3X3, Maximize2 } from "lucide-react";
import StockChart from "./StockChart";
import TradingInterface from "./TradingInterface";
import type { HistoricalDataPoint } from "@/data/mockStocks";

interface DualChartViewProps {
  primaryData: HistoricalDataPoint[];
  primarySymbol: string;
  primaryPrice: number;
  primaryChange: number;
  primaryTimeframe: '1m' | '2m' | '5m' | '30m';
  onPrimaryTimeframeChange: (timeframe: '1m' | '2m' | '5m' | '30m') => void;
  onPrimaryStockChange: (symbol: string) => void;
  availableStocks: Array<{symbol: string; name: string;}>;
  secondaryData?: HistoricalDataPoint[];
  secondarySymbol?: string;
  secondaryPrice?: number;
  secondaryChange?: number;
  secondaryTimeframe?: '1m' | '2m' | '5m' | '30m';
  onSecondaryTimeframeChange?: (timeframe: '1m' | '2m' | '5m' | '30m') => void;
  onSecondaryStockChange?: (symbol: string) => void;
}

const DualChartView = ({
  primaryData,
  primarySymbol,
  primaryPrice,
  primaryChange,
  primaryTimeframe,
  onPrimaryTimeframeChange,
  onPrimaryStockChange,
  availableStocks,
  secondaryData,
  secondarySymbol,
  secondaryPrice,
  secondaryChange,
  secondaryTimeframe,
  onSecondaryTimeframeChange,
  onSecondaryStockChange,
}: DualChartViewProps) => {
  const [viewMode, setViewMode] = useState<'single' | 'dual'>('single');
  const [selectedChartForTrading, setSelectedChartForTrading] = useState<'primary' | 'secondary'>('primary');

  const isDualView = viewMode === 'dual' && secondaryData && secondarySymbol;

  return (
    <div className="space-y-4">
      {/* View Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Chart View Options</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'single' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('single')}
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Single Chart
              </Button>
              <Button
                variant={viewMode === 'dual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('dual')}
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                Dual Charts
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chart Area */}
      <div className={`grid gap-4 ${isDualView ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Primary Chart */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Primary</Badge>
                  <Select value={primarySymbol} onValueChange={onPrimaryStockChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStocks.map((stock) => (
                        <SelectItem key={stock.symbol} value={stock.symbol}>
                          {stock.symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant={selectedChartForTrading === 'primary' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedChartForTrading('primary')}
                >
                  Trade Here
                </Button>
              </div>
            </CardHeader>
          </Card>
          
          <StockChart
            data={primaryData}
            symbol={primarySymbol}
            currentPrice={primaryPrice}
            change={primaryChange}
            timeframe={primaryTimeframe}
            onTimeframeChange={onPrimaryTimeframeChange}
          />
        </div>

        {/* Secondary Chart */}
        {isDualView && secondaryData && secondarySymbol && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Secondary</Badge>
                    <Select value={secondarySymbol} onValueChange={onSecondaryStockChange}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStocks.map((stock) => (
                          <SelectItem key={stock.symbol} value={stock.symbol}>
                            {stock.symbol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant={selectedChartForTrading === 'secondary' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedChartForTrading('secondary')}
                  >
                    Trade Here
                  </Button>
                </div>
              </CardHeader>
            </Card>
            
            <StockChart
              data={secondaryData}
              symbol={secondarySymbol}
              currentPrice={secondaryPrice || 0}
              change={secondaryChange || 0}
              timeframe={secondaryTimeframe || '1m'}
              onTimeframeChange={onSecondaryTimeframeChange || (() => {})}
            />
          </div>
        )}
      </div>

      {/* Trading Interface */}
      <TradingInterface
        symbol={selectedChartForTrading === 'primary' ? primarySymbol : secondarySymbol || primarySymbol}
        currentPrice={selectedChartForTrading === 'primary' ? primaryPrice : secondaryPrice || primaryPrice}
      />
    </div>
  );
};

export default DualChartView;