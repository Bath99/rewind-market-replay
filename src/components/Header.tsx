import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

const Header = () => {
  const location = useLocation();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              FinanceReplay
            </span>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link to="/">
              <Button 
                variant={location.pathname === "/" ? "default" : "ghost"} 
                size="sm"
              >
                Home
              </Button>
            </Link>
            <Link to="/replay">
              <Button 
                variant={location.pathname === "/replay" ? "default" : "ghost"} 
                size="sm"
              >
                Replay
              </Button>
            </Link>
            <Link to="/news">
              <Button 
                variant={location.pathname === "/news" ? "default" : "ghost"} 
                size="sm"
              >
                News & Events
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;