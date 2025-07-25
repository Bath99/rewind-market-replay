import React, { useEffect, useRef, memo } from 'react';

let tvScriptLoadingPromise: Promise<void> | null = null;

declare global {
  interface Window {
    TradingView: any;
  }
}

interface CryptoChartProps {
  symbol?: string;
  width?: string | number;
  height?: string | number;
  interval?: string;
  theme?: 'light' | 'dark';
  style?: string;
  locale?: string;
  timezone?: string;
  toolbar_bg?: string;
  enable_publishing?: boolean;
  allow_symbol_change?: boolean;
  container_id?: string;
  hide_top_toolbar?: boolean;
  hide_legend?: boolean;
  save_image?: boolean;
  hide_volume?: boolean;
  studies?: string[];
  show_popup_button?: boolean;
  popup_width?: string;
  popup_height?: string;
}

export const CryptoChart: React.FC<CryptoChartProps> = memo(({
  symbol = "BINANCE:BTCUSDT",
  width = "100%",
  height = "500",
  interval = "D",
  theme = "dark",
  style = "1",
  locale = "en",
  timezone = "Etc/UTC",
  toolbar_bg = "#f1f3f6",
  enable_publishing = false,
  allow_symbol_change = true,
  container_id = "tradingview_chart",
  hide_top_toolbar = false,
  hide_legend = false,
  save_image = false,
  hide_volume = false,
  studies = [],
  show_popup_button = false,
  popup_width = "1000",
  popup_height = "650"
}) => {
  const onLoadScriptRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise<void>((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => {
      if (onLoadScriptRef.current) {
        onLoadScriptRef.current();
      }
    });

    return () => {
      onLoadScriptRef.current = null;
    };

    function createWidget() {
      if (document.getElementById(container_id) && 'TradingView' in window) {
        new window.TradingView.widget({
          autosize: width === "100%",
          width: width,
          height: height,
          symbol: symbol,
          interval: interval,
          timezone: timezone,
          theme: theme,
          style: style,
          locale: locale,
          toolbar_bg: toolbar_bg,
          enable_publishing: enable_publishing,
          allow_symbol_change: allow_symbol_change,
          container_id: container_id,
          hide_top_toolbar: hide_top_toolbar,
          hide_legend: hide_legend,
          save_image: save_image,
          hide_volume: hide_volume,
          studies: studies,
          show_popup_button: show_popup_button,
          popup_width: popup_width,
          popup_height: popup_height,
        });
      }
    }
  }, [
    symbol,
    width,
    height,
    interval,
    theme,
    style,
    locale,
    timezone,
    toolbar_bg,
    enable_publishing,
    allow_symbol_change,
    container_id,
    hide_top_toolbar,
    hide_legend,
    save_image,
    hide_volume,
    studies,
    show_popup_button,
    popup_width,
    popup_height
  ]);

  return (
    <div className="tradingview-widget-container" style={{ height, width }}>
      <div id={container_id} style={{ height: "100%", width: "100%" }} />
    </div>
  );
});

CryptoChart.displayName = 'CryptoChart';

export default CryptoChart;