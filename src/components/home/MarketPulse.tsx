import { useEffect, useState } from 'react';
import { getMarketPulse } from '@/services/market';
import { marketPulseData } from '@/data/mockMarket';
import type { MarketPulseItem } from '@/lib/types';
import { tr } from '@/lib/lang';

const REFRESH_MS = 60_000;

export default function MarketPulse() {
  const [items, setItems] = useState<MarketPulseItem[]>(marketPulseData);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const load = async () => {
      const res = await getMarketPulse(controller.signal);
      if (!active) return;
      setItems(res.items);
      setLive(res.live);
    };

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      active = false;
      controller.abort();
      clearInterval(id);
    };
  }, []);

  const doubled = [...items, ...items];

  return (
    <div className="h-[42px] border-t border-xing-border-subtle flex items-center bg-[rgba(0,0,0,0.82)] backdrop-blur-sm overflow-hidden shrink-0 select-none">
      {/* Fixed left label */}
      <div className="shrink-0 pl-5 pr-4 flex items-center gap-2 h-full border-r border-xing-border-subtle">
        <span
          className={`w-1.5 h-1.5 rounded-full animate-pulse-soft ${live ? 'bg-xing-green/80' : 'bg-xing-green/40'}`}
          title={live ? 'Live market data' : 'Fallback data'}
        />
        <span className="text-[10px] text-xing-text-2/45 font-mono tracking-[0.05em] whitespace-nowrap">MARKET PULSE</span>
      </div>

      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden relative group">
        <div className="flex items-center gap-8 animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]">
          {doubled.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2.5 text-[11px] shrink-0">
              <span className="text-xing-text-3 font-medium">{tr(item.label)}</span>
              <span className="font-mono text-xing-text-2">{item.value}</span>
              <span className={`font-mono text-[10px] ${
                item.status === 'up' ? 'text-xing-green' : item.status === 'down' ? 'text-xing-red/75' : 'text-xing-yellow/75'
              }`}>
                {item.change}
              </span>
              <span className="text-xing-border-subtle mx-1">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Fixed right status */}
      <div className="shrink-0 px-4 border-l border-xing-border-subtle h-full flex items-center">
        <span className="text-[10px] text-xing-text-disabled/45 font-mono whitespace-nowrap">
          {live ? 'LIVE' : '09:41 ET'}
        </span>
      </div>
    </div>
  );
}
