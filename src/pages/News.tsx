import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, AlertTriangle, Building, RefreshCw, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { NewsService, NewsItem, EconomicEvent } from "@/services/newsService";

const initialNewsItems: NewsItem[] = [
  {
    id: "1",
    title: "Federal Reserve Announces Interest Rate Decision",
    description: "The Fed maintains current rates amid inflation concerns and economic uncertainty.",
    time: "2 hours ago",
    source: "Reuters",
    category: "Central Banking",
    impact: "high",
    url: "https://www.reuters.com/business/finance/federal-reserve-interest-rate-decision",
    published: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: "2",
    title: "NVDA Reports Record Q4 Earnings",
    description: "NVIDIA beats analyst expectations with strong AI chip demand driving revenue growth.",
    time: "4 hours ago",
    source: "Bloomberg",
    category: "Earnings",
    impact: "high",
    url: "https://www.bloomberg.com/news/companies/nvda",
    published: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  {
    id: "3",
    title: "Oil Prices Rise on Supply Concerns",
    description: "Crude oil futures climb as geopolitical tensions affect global supply chains.",
    time: "6 hours ago",
    source: "Wall Street Journal",
    category: "Commodities",
    impact: "medium",
    url: "https://www.wsj.com/articles/oil-prices-supply-concerns",
    published: new Date(Date.now() - 6 * 60 * 60 * 1000)
  }
];

const calendarEvents = [
  {
    id: 1,
    title: "AAPL Earnings Call",
    date: "Today, 4:30 PM ET",
    type: "Earnings",
    impact: "high"
  },
  {
    id: 2,
    title: "Consumer Price Index (CPI)",
    date: "Tomorrow, 8:30 AM ET",
    type: "Economic Data",
    impact: "high"
  },
  {
    id: 3,
    title: "TSLA Investor Day",
    date: "March 15, 2:00 PM ET",
    type: "Corporate Event",
    impact: "medium"
  }
];

const News = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(initialNewsItems);
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    // Start auto-refresh for real-time updates
    const cleanup = NewsService.startAutoRefresh(
      (news) => {
        setNewsItems(news);
        setLastUpdated(new Date());
      },
      (events) => {
        setEconomicEvents(events);
        setLastUpdated(new Date());
      }
    );

    return cleanup;
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [news, events] = await Promise.all([
        NewsService.fetchEconomicNews(),
        NewsService.fetchTodaysEconomicEvents()
      ]);
      setNewsItems(news);
      setEconomicEvents(events);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getImpactColor = (impact: string) => {
    return NewsService.getImpactColor(impact);
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="h-3 w-3" />;
      case 'medium': return <TrendingUp className="h-3 w-3" />;
      default: return <Building className="h-3 w-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-foreground">Market News & Events</h1>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="hover:scale-105 transition-transform"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-muted-foreground">Real-time Bloomberg economics news and TradingTerminal calendar updates</p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Bloomberg-style Economic News Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Bloomberg Economics News</h2>
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                LIVE
              </Badge>
            </div>
            
            <div className="space-y-4">
              {newsItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors flex items-center gap-2">
                            {item.title}
                            <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {item.description}
                          </CardDescription>
                        </div>
                        <Badge className={`${getImpactColor(item.impact)} flex items-center gap-1 shrink-0`}>
                          {getImpactIcon(item.impact)}
                          {item.impact}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="font-medium">{item.source}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.category}</Badge>
                          <span>{item.time}</span>
                        </div>
                      </div>
                    </CardContent>
                  </a>
                </Card>
              ))}
            </div>
          </div>

          {/* TradingTerminal Economic Calendar Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Today's Economic Events</h2>
              <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20">
                TradingTerminal
              </Badge>
            </div>
            
            
            <div className="space-y-4">
              {economicEvents.length > 0 ? (
                economicEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-lg font-mono font-bold text-primary bg-primary/10 rounded px-2 py-1">
                            {event.time}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <img 
                                src={`https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${event.flag}.svg`}
                                alt={event.country}
                                className="w-4 h-3 rounded-sm"
                              />
                              <h3 className="font-semibold text-foreground">{event.event}</h3>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-muted-foreground">Actual:</span>
                                <span className="font-mono text-foreground font-bold">{event.actual}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-muted-foreground">Est:</span>
                                <span className="font-mono text-muted-foreground">{event.estimate}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-muted-foreground">Prev:</span>
                                <span className="font-mono text-muted-foreground">{event.previous}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${getImpactColor(event.impact)} flex items-center gap-1 shrink-0`}>
                          {getImpactIcon(event.impact)}
                          {event.impact}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="p-6 text-center text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Loading today's economic events...</p>
                </Card>
              )}
            </div>

            {/* Market Hours Card */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Market Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">NYSE & NASDAQ:</span>
                    <span className="font-mono text-foreground">9:30 AM - 4:00 PM ET</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pre-Market:</span>
                    <span className="font-mono text-foreground">4:00 AM - 9:30 AM ET</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">After Hours:</span>
                    <span className="font-mono text-foreground">4:00 PM - 8:00 PM ET</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;