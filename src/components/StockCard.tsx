import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  onClick?: () => void;
}

const StockCard = ({ symbol, name, price, change, changePercent, onClick }: StockCardProps) => {
  const isPositive = change >= 0;
  
  return (
    <Card 
      className="hover:bg-accent/50 transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30 group"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground">{symbol}</h3>
            <p className="text-sm text-muted-foreground truncate">{name}</p>
          </div>
          <div className="flex items-center">
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-success" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive" />
            )}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-mono font-bold text-foreground">
            ${price.toFixed(2)}
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={isPositive ? "default" : "destructive"}
              className={isPositive ? "bg-success/20 text-success border-success/30" : ""}
            >
              {isPositive ? "+" : ""}{change.toFixed(2)}
            </Badge>
            <span className={`text-sm font-mono ${isPositive ? "text-success" : "text-destructive"}`}>
              ({isPositive ? "+" : ""}{changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockCard;