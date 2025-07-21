import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import StockCard from "@/components/StockCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockStocks } from "@/data/mockStocks";
import { Play, TrendingUp, BarChart3, Clock } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const handleStockClick = (symbol: string) => {
    navigate(`/replay?symbol=${symbol}`);
  };

  const featuredStocks = mockStocks.slice(0, 6);
  const gainers = mockStocks.filter(stock => stock.change > 0).slice(0, 3);
  const losers = mockStocks.filter(stock => stock.change < 0).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-success to-primary bg-clip-text text-transparent animate-slide-up">
              Replay Financial History
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Travel back in time and replay historical stock data from NYSE and NASDAQ. 
              Watch how markets moved, learn from the past, and understand market dynamics.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button 
                size="lg" 
                onClick={() => navigate('/replay')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Replay
              </Button>
              <Button size="lg" variant="outline">
                <BarChart3 className="mr-2 h-5 w-5" />
                View Market Data
              </Button>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-all duration-300">
                <CardHeader className="text-center pb-2">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Historical Replay</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Replay any stock's price movements with precise historical accuracy
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-all duration-300">
                <CardHeader className="text-center pb-2">
                  <TrendingUp className="h-12 w-12 text-success mx-auto mb-2" />
                  <CardTitle className="text-lg">Live Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Play, pause, fast-forward through market data at your own pace
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50 hover:bg-card/80 transition-all duration-300">
                <CardHeader className="text-center pb-2">
                  <BarChart3 className="h-12 w-12 text-chart-neutral mx-auto mb-2" />
                  <CardTitle className="text-lg">Market Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Analyze patterns and understand market movements over time
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="py-16 px-4 bg-card/20">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Featured Stocks */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Featured Stocks</h2>
                <Button variant="outline" size="sm" onClick={() => navigate('/replay')}>
                  View All
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {featuredStocks.map((stock) => (
                  <StockCard
                    key={stock.symbol}
                    {...stock}
                    onClick={() => handleStockClick(stock.symbol)}
                  />
                ))}
              </div>
            </div>

            {/* Market Movers */}
            <div className="space-y-6">
              {/* Top Gainers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 text-success mr-2" />
                    Top Gainers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {gainers.map((stock) => (
                    <div 
                      key={stock.symbol} 
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => handleStockClick(stock.symbol)}
                    >
                      <div>
                        <div className="font-semibold text-sm">{stock.symbol}</div>
                        <div className="text-xs text-muted-foreground">${stock.price.toFixed(2)}</div>
                      </div>
                      <Badge className="bg-success/20 text-success border-success/30">
                        +{stock.changePercent.toFixed(2)}%
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Top Losers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 text-destructive mr-2 rotate-180" />
                    Top Losers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {losers.map((stock) => (
                    <div 
                      key={stock.symbol} 
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => handleStockClick(stock.symbol)}
                    >
                      <div>
                        <div className="font-semibold text-sm">{stock.symbol}</div>
                        <div className="text-xs text-muted-foreground">${stock.price.toFixed(2)}</div>
                      </div>
                      <Badge variant="destructive">
                        {stock.changePercent.toFixed(2)}%
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
