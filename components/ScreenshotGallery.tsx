import React, { useState, useMemo } from 'react';
import { Trade } from '../types';
import { Image as ImageIcon, Maximize2, X, Calendar, Tag, ExternalLink } from 'lucide-react';

interface ScreenshotGalleryProps {
  trades: Trade[];
}

export const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({ trades }) => {
  const [selectedScreenshot, setSelectedScreenshot] = useState<Trade | null>(null);

  const galleryItems = useMemo(() => {
    return trades.filter(t => !!t.screenshotUrl);
  }, [trades]);

  if (galleryItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-700 text-slate-500">
        <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">No screenshots captured yet.</p>
        <p className="text-sm">Attach chart evidence to your trades to build your visual gallery.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {galleryItems.map((trade) => (
          <div 
            key={trade.id} 
            className="group relative bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer shadow-lg hover:shadow-blue-500/10"
            onClick={() => setSelectedScreenshot(trade)}
          >
            <div className="aspect-video relative overflow-hidden bg-slate-900">
              <img 
                src={trade.screenshotUrl} 
                alt={`${trade.symbol} trade chart`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <div className="p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-white">{trade.symbol}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  trade.pnl && trade.pnl >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {trade.pnl && trade.pnl >= 0 ? '+' : ''}{trade.pnl?.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(trade.date).toLocaleDateString()}
                </div>
                {trade.setup && (
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {trade.setup}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl flex flex-col max-h-[95vh]">
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {selectedScreenshot.symbol} Chart Evidence
                  </h3>
                  <p className="text-xs text-slate-400">
                    {new Date(selectedScreenshot.date).toLocaleString()} • {selectedScreenshot.setup || 'No Setup'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a 
                  href={selectedScreenshot.screenshotUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700"
                  title="Open full size"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button 
                  onClick={() => setSelectedScreenshot(null)}
                  className="p-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto bg-slate-900 rounded-2xl border border-slate-700 flex items-center justify-center">
              <img 
                src={selectedScreenshot.screenshotUrl} 
                alt="Trade chart full size" 
                className="max-w-full h-auto"
              />
            </div>
            
            <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
               <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Trade Context</h4>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-bold">Outcome</p>
                    <p className={`font-bold ${
                      selectedScreenshot.pnl && selectedScreenshot.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {selectedScreenshot.outcome} ({selectedScreenshot.pnl?.toFixed(2)})
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-bold">Entry Price</p>
                    <p className="text-white font-mono">{selectedScreenshot.entryPrice}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-bold">Exit Price</p>
                    <p className="text-white font-mono">{selectedScreenshot.exitPrice || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase font-bold">R:R</p>
                    <p className="text-blue-400 font-bold">
                       {selectedScreenshot.stopLoss && selectedScreenshot.takeProfit 
                          ? `1:${(Math.abs(selectedScreenshot.takeProfit - selectedScreenshot.entryPrice) / Math.abs(selectedScreenshot.entryPrice - selectedScreenshot.stopLoss)).toFixed(2)}`
                          : 'N/A'
                       }
                    </p>
                  </div>
               </div>
               {selectedScreenshot.notes && (
                 <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-slate-400 italic text-sm">"{selectedScreenshot.notes}"</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
