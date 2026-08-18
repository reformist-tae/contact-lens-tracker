import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

export const AndroidStatusBar: React.FC = () => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="bg-emerald-950 text-emerald-200 px-6 py-2 flex items-center justify-between text-xs select-none font-medium">
      <div className="flex items-center space-x-1">
        <span>{timeStr}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Signal className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center">
          <Battery className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
