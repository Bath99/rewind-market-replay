import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, AlertTriangle, Building } from "lucide-react";
import Header from "@/components/Header";

const newsItems = [
  {
    id: 1,
    title: "Federal Reserve Announces Interest Rate Decision",
    description: "The Fed maintains current rates amid inflation concerns and economic uncertainty.",
    time: "2 hours ago",
    source: "Reuters",
    category: "Central Banking",
    impact: "high"
  },
  {
    id: 2,
    title: "NVDA Reports Record Q4 Earnings",
    description: "NVIDIA beats analyst expectations with strong AI chip demand driving revenue growth.",
    time: "4 hours ago",
    source: "Bloomberg",
    category: "Earnings",
    impact: "high"
  },
  {
    id: 3,
    title: "Oil Prices Rise on Supply Concerns",
    description: "Crude oil futures climb as geopolitical tensions affect global supply chains.",
    time: "6 hours ago",
    source: "Wall Street Journal",
    category: "Commodities",
    impact: "medium"
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
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
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
          <h1 className="text-4xl font-bold text-foreground">Market News & Events</h1>
          <p className="text-muted-foreground">Stay updated with the latest financial news and upcoming market events</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* News Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Latest News</h2>
            </div>
            
            <div className="space-y-4">
              {newsItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight hover:text-primary transition-colors">
                          {item.title}
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
                </Card>
              ))}
            </div>
          </div>

          {/* Calendar Events Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Upcoming Events</h2>
            </div>
            
            <div className="space-y-4">
              {calendarEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-lg mb-2">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{event.date}</p>
                        <Badge variant="outline" className="text-xs">
                          {event.type}
                        </Badge>
                      </div>
                      <Badge className={`${getImpactColor(event.impact)} flex items-center gap-1 shrink-0`}>
                        {getImpactIcon(event.impact)}
                        {event.impact}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
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