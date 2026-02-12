import React, { useEffect, useState } from 'react';
import { fetchMarketNews } from '../services/geminiService';
import { NewsItem } from '../types';
import { Globe, RefreshCw, ExternalLink } from 'lucide-react';

export const NewsWidget: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNews = async () => {
    setLoading(true);
    const items = await fetchMarketNews();
    setNews(items);
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col h-full shadow-sm">
      <div className="p-4 border-b border-slate-700 bg-slate-800/50 rounded-t-xl flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />
          <h3 className="font-bold text-slate-100 text-sm">Market Headlines</h3>
        </div>
        <button 
          onClick={loadNews}
          disabled={loading}
          className={`p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-all ${loading ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {loading ? (
          <div className="space-y-3">
             {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                    <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-700/50 rounded w-1/2"></div>
                </div>
             ))}
          </div>
        ) : news.length > 0 ? (
          <div className="space-y-4">
            {news.map((item, index) => (
              <a 
                key={index} 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block group"
              >
                <h4 className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors line-clamp-2">
                   {item.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {item.source}
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-500 text-xs py-8">
            <p>No headlines found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
