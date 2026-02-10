import React, { useMemo } from 'react';
import { Trade, TradeType, Outcome, Emotion } from '../types';
import { BrainCircuit, AlertTriangle, CheckCircle, TrendingUp, ShieldAlert, HeartPulse } from 'lucide-react';

interface AICoachProps {
  trades: Trade[];
  currency: string;
}

export const AICoach: React.FC<AICoachProps> = ({ trades, currency }) => {
  
  const insights = useMemo(() => {
    if (trades.length < 3) {
      return [{
        type: 'neutral',
        title: 'Not Enough Data',
        message: 'Log at least 3 trades to generate a coaching report.',
        icon: <BrainCircuit className="w-5 h-5 text-slate-400" />
      }];
    }

    const report = [];

    // 1. Risk Management Check (Stop Loss)
    const tradesWithSL = trades.filter(t => t.stopLoss > 0).length;
    const slPercentage = (tradesWithSL / trades.length) * 100;
    
    if (slPercentage < 80) {
      report.push({
        type: 'danger',
        title: 'Missing Stop Losses',
        message: `You only used a Stop Loss in ${slPercentage.toFixed(0)}% of your trades. This is a critical risk. Every trade must have a predefined invalidation point.`,
        icon: <ShieldAlert className="w-5 h-5 text-red-400" />
      });
    } else {
      report.push({
        type: 'success',
        title: 'Good Risk Discipline',
        message: 'You are consistently setting Stop Losses. Keep this up to protect your capital.',
        icon: <CheckCircle className="w-5 h-5 text-emerald-400" />
      });
    }

    // 2. Profit Factor / Avg Risk:Reward
    const wins = trades.filter(t => t.outcome === Outcome.WIN);
    const losses = trades.filter(t => t.outcome === Outcome.LOSS);
    
    const avgWin = wins.length > 0 ? wins.reduce((acc, t) => acc + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0) / losses.length) : 0;

    if (avgLoss > avgWin) {
      report.push({
        type: 'warning',
        title: 'Inverse Risk/Reward',
        message: `Your average loss (${currency}${avgLoss.toFixed(2)}) is bigger than your average win (${currency}${avgWin.toFixed(2)}). You need to cut losers faster or let winners run longer.`,
        icon: <TrendingUp className="w-5 h-5 text-orange-400" />
      });
    } else if (avgWin > avgLoss * 2) {
      report.push({
        type: 'success',
        title: 'Excellent Asymmetry',
        message: `Your average win is more than 2x your average loss. This takes pressure off your win rate.`,
        icon: <TrendingUp className="w-5 h-5 text-emerald-400" />
      });
    }

    // 3. Emotional Analysis
    const emotions = trades.flatMap(t => t.emotions);
    const emotionCounts = emotions.reduce((acc, e) => {
      acc[e] = (acc[e] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const badEmotions = (emotionCounts[Emotion.FOMO] || 0) + (emotionCounts[Emotion.REVENGE] || 0) + (emotionCounts[Emotion.ANXIOUS] || 0);
    const goodEmotions = (emotionCounts[Emotion.DISCIPLINED] || 0) + (emotionCounts[Emotion.CONFIDENT] || 0);

    if (badEmotions > goodEmotions) {
      report.push({
        type: 'danger',
        title: 'Emotional Instability',
        message: 'High frequency of FOMO, Revenge, or Anxiety detected. Review your position sizing; smaller size often reduces anxiety.',
        icon: <HeartPulse className="w-5 h-5 text-red-400" />
      });
    }

    // 4. Directional Bias
    const longs = trades.filter(t => t.type === TradeType.LONG);
    const shorts = trades.filter(t => t.type === TradeType.SHORT);
    const longWinRate = longs.length ? (longs.filter(t => t.outcome === Outcome.WIN).length / longs.length) * 100 : 0;
    const shortWinRate = shorts.length ? (shorts.filter(t => t.outcome === Outcome.WIN).length / shorts.length) * 100 : 0;

    if (Math.abs(longWinRate - shortWinRate) > 30 && longs.length > 3 && shorts.length > 3) {
      const betterSide = longWinRate > shortWinRate ? 'Long' : 'Short';
      report.push({
        type: 'info',
        title: `Directional Bias Found`,
        message: `You are significantly better at ${betterSide}s (${Math.max(longWinRate, shortWinRate).toFixed(0)}% WR) than ${betterSide === 'Long' ? 'Short' : 'Long'}s. Consider focusing on your strength.`,
        icon: <BrainCircuit className="w-5 h-5 text-blue-400" />
      });
    }

    return report;
  }, [trades]);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 h-[600px] flex flex-col shadow-xl">
      <div className="p-4 border-b border-slate-700 bg-slate-800/50 rounded-t-xl flex items-center gap-2">
        <div className="p-2 bg-purple-500/20 rounded-lg">
           <BrainCircuit className="w-6 h-6 text-purple-400" />
        </div>
        <div>
           <h3 className="font-bold text-slate-100">Coach Report</h3>
           <p className="text-xs text-slate-400">Automated Performance Analysis</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {insights.map((item, idx) => (
          <div 
            key={idx} 
            className={`p-4 rounded-xl border flex gap-4 ${
              item.type === 'danger' ? 'bg-red-900/10 border-red-900/30' :
              item.type === 'warning' ? 'bg-orange-900/10 border-orange-900/30' :
              item.type === 'success' ? 'bg-emerald-900/10 border-emerald-900/30' :
              'bg-slate-700/30 border-slate-600/50'
            }`}
          >
            <div className={`mt-1 p-2 rounded-full h-fit ${
               item.type === 'danger' ? 'bg-red-500/20' :
               item.type === 'warning' ? 'bg-orange-500/20' :
               item.type === 'success' ? 'bg-emerald-500/20' :
               'bg-slate-600/30'
            }`}>
              {item.icon}
            </div>
            <div>
              <h4 className={`font-bold text-sm mb-1 ${
                item.type === 'danger' ? 'text-red-400' :
                item.type === 'warning' ? 'text-orange-400' :
                item.type === 'success' ? 'text-emerald-400' :
                'text-slate-200'
              }`}>
                {item.title}
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {item.message}
              </p>
            </div>
          </div>
        ))}

        {trades.length >= 3 && (
          <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-slate-700 text-center">
            <h4 className="text-slate-200 font-semibold mb-2">Trading Mantra for You</h4>
            <p className="text-slate-400 italic text-sm">
              "Process over outcome. If you followed your rules, the trade was a success, regardless of the P&L."
            </p>
          </div>
        )}
      </div>
    </div>
  );
};