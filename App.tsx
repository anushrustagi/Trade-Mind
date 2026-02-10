import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { TradeList } from './components/TradeList';
import { TradeForm } from './components/TradeForm';
import { AICoach } from './components/AICoach';
import { Planner } from './components/Planner'; // Import Planner
import { Trade, Task, CalendarEvent } from './types';
import { LayoutDashboard, BookOpen, Brain, Plus, Wallet, Check, Edit2, CalendarDays, Settings, ArrowUpCircle, ArrowDownCircle, Shield } from 'lucide-react';

const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' },
  { code: 'JPY', symbol: '¥' },
  { code: 'AUD', symbol: 'A$' },
  { code: 'CAD', symbol: 'C$' },
  { code: 'BTC', symbol: '₿' },
  { code: 'ETH', symbol: 'Ξ' },
];

const App: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'journal' | 'planner' | 'coach'>('dashboard');
  
  // State for Form Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | undefined>(undefined);

  const [initialCapital, setInitialCapital] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('$');
  
  // New States for Features
  const [dailyTradeLimit, setDailyTradeLimit] = useState<number>(0); // 0 means no limit
  const [isFundsModalOpen, setIsFundsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState('');

  // Load from local storage on mount
  useEffect(() => {
    const savedTrades = localStorage.getItem('tradeMind_trades');
    if (savedTrades) {
      try {
        setTrades(JSON.parse(savedTrades));
      } catch (e) {
        console.error("Failed to parse trades", e);
      }
    }

    const savedTasks = localStorage.getItem('tradeMind_tasks');
    if (savedTasks) {
       try { setTasks(JSON.parse(savedTasks)); } catch (e) {}
    }

    const savedEvents = localStorage.getItem('tradeMind_events');
    if (savedEvents) {
       try { setEvents(JSON.parse(savedEvents)); } catch (e) {}
    }

    const savedCapital = localStorage.getItem('tradeMind_capital');
    if (savedCapital) {
      setInitialCapital(parseFloat(savedCapital));
    }

    const savedCurrency = localStorage.getItem('tradeMind_currency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
    
    const savedLimit = localStorage.getItem('tradeMind_dailyLimit');
    if (savedLimit) {
      setDailyTradeLimit(parseInt(savedLimit, 10));
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('tradeMind_trades', JSON.stringify(trades));
  }, [trades]);

  useEffect(() => {
    localStorage.setItem('tradeMind_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('tradeMind_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('tradeMind_capital', initialCapital.toString());
  }, [initialCapital]);

  useEffect(() => {
    localStorage.setItem('tradeMind_currency', currency);
  }, [currency]);
  
  useEffect(() => {
    localStorage.setItem('tradeMind_dailyLimit', dailyTradeLimit.toString());
  }, [dailyTradeLimit]);

  // Trade Handlers
  const handleSaveTrade = (trade: Trade) => {
    if (tradeToEdit) {
      // Update existing trade
      setTrades(prev => prev.map(t => t.id === trade.id ? trade : t));
    } else {
      // Add new trade
      setTrades(prev => [trade, ...prev]);
    }
    closeForm();
  };

  const handleDeleteTrade = (id: string) => {
    if (window.confirm("Are you sure you want to delete this trade?")) {
      setTrades(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleEditTrade = (trade: Trade) => {
    setTradeToEdit(trade);
    setIsFormOpen(true);
  };

  // Planner Handlers
  const handleAddTask = (task: Task) => setTasks(prev => [...prev, task]);
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };
  const handleToggleTask = (id: string) => {
     setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };
  const handleDeleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  
  const handleAddEvent = (event: CalendarEvent) => setEvents(prev => [...prev, event]);
  const handleDeleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  // Funds Handlers
  const handleDeposit = () => {
    const amt = parseFloat(transactionAmount);
    if (amt > 0) {
      setInitialCapital(prev => prev + amt);
      setTransactionAmount('');
      setIsFundsModalOpen(false);
    }
  };

  const handleWithdraw = () => {
    const amt = parseFloat(transactionAmount);
    if (amt > 0) {
      setInitialCapital(prev => prev - amt);
      setTransactionAmount('');
      setIsFundsModalOpen(false);
    }
  };

  // Logic for Trade Limit
  const todayTradeCount = trades.filter(t => 
      new Date(t.date).toDateString() === new Date().toDateString()
  ).length;

  const handleLogTradeClick = () => {
    if (dailyTradeLimit > 0 && todayTradeCount >= dailyTradeLimit) {
        if(!window.confirm(`⚠️ DAILY LIMIT REACHED\n\nYou have already taken ${todayTradeCount} trades today. The limit is ${dailyTradeLimit}.\n\nDo you really want to break your rule?`)) {
            return;
        }
    }
    setTradeToEdit(undefined);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setTradeToEdit(undefined);
    setIsFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-purple-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 md:px-8 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">TM</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white hidden md:block">TradeMind</h1>
        </div>

        <nav className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'dashboard' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'journal' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Journal</span>
          </button>
          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'planner' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span className="hidden sm:inline">Planner</span>
          </button>
          <button
            onClick={() => setActiveTab('coach')}
            className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'coach' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Coach</span>
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {/* Capital Widget */}
          <button 
             onClick={() => setIsFundsModalOpen(true)}
             className="hidden sm:flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            <Wallet className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-slate-200">
              {initialCapital > 0 ? `${currency}${initialCapital.toLocaleString()}` : 'Funds'}
            </span>
          </button>

          {/* Settings Widget */}
          <button 
             onClick={() => setIsSettingsModalOpen(true)}
             className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative"
             title="Risk Settings"
          >
            <Settings className="w-5 h-5" />
            {dailyTradeLimit > 0 && todayTradeCount >= dailyTradeLimit && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>

          <button
            onClick={handleLogTradeClick}
            className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg ${
                dailyTradeLimit > 0 && todayTradeCount >= dailyTradeLimit
                ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20'
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
            }`}
          >
            {dailyTradeLimit > 0 && todayTradeCount >= dailyTradeLimit ? <Shield className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span className="hidden sm:inline">Log Trade</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-500">
             <div className="mb-8 flex justify-between items-end">
               <div>
                 <h2 className="text-2xl font-bold text-white mb-2">Trading Performance</h2>
                 <p className="text-slate-400">Track your progress and equity curve.</p>
               </div>
               {dailyTradeLimit > 0 && (
                 <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 flex flex-col items-end">
                    <span className="text-xs text-slate-400 uppercase font-bold">Daily Trades</span>
                    <span className={`text-lg font-mono font-bold ${todayTradeCount >= dailyTradeLimit ? 'text-red-400' : 'text-emerald-400'}`}>
                        {todayTradeCount} / {dailyTradeLimit}
                    </span>
                 </div>
               )}
             </div>
             <Dashboard trades={trades} initialCapital={initialCapital} currency={currency} />
             <div className="mt-8">
                <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                <TradeList 
                  trades={trades.slice(0, 5)} 
                  initialCapital={initialCapital}
                  currency={currency}
                  onEdit={handleEditTrade}
                  onDelete={handleDeleteTrade}
                />
             </div>
          </div>
        )}

        {activeTab === 'journal' && (
          <div className="animate-in fade-in duration-500">
             <div className="mb-8 flex justify-between items-end">
               <div>
                 <h2 className="text-2xl font-bold text-white mb-2">Trade Journal</h2>
                 <p className="text-slate-400">Detailed history of all your executions.</p>
               </div>
             </div>
             <TradeList 
                trades={trades} 
                initialCapital={initialCapital}
                currency={currency} 
                onEdit={handleEditTrade}
                onDelete={handleDeleteTrade}
             />
          </div>
        )}

        {activeTab === 'planner' && (
          <div className="animate-in fade-in duration-500 h-[calc(100vh-140px)]">
             <div className="mb-6">
               <h2 className="text-2xl font-bold text-white mb-2">Day Planner & Events</h2>
               <p className="text-slate-400">Structure your trading day and stay ahead of market events.</p>
             </div>
             <Planner 
                tasks={tasks}
                events={events}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onAddEvent={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
             />
          </div>
        )}

        {activeTab === 'coach' && (
          <div className="animate-in fade-in duration-500 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
            <div className="lg:col-span-2 h-full">
               <AICoach trades={trades} currency={currency} />
            </div>
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 h-fit">
              <h3 className="font-bold text-white mb-4">Psychology Tips</h3>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex gap-3">
                  <div className="min-w-[4px] h-full bg-blue-500 rounded-full"></div>
                  <p>Never move your stop loss further away from entry. Acceptance of risk is key.</p>
                </li>
                <li className="flex gap-3">
                  <div className="min-w-[4px] h-full bg-purple-500 rounded-full"></div>
                  <p>If you feel anxious, your position size is likely too big.</p>
                </li>
                <li className="flex gap-3">
                  <div className="min-w-[4px] h-full bg-emerald-500 rounded-full"></div>
                  <p>A winning trade with bad process is worse than a losing trade with good process.</p>
                </li>
              </ul>
              
              <div className="mt-8 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                 <h4 className="font-semibold text-slate-200 mb-2">Journal Stats</h4>
                 <div className="flex justify-between text-sm text-slate-400">
                    <span>Entries</span>
                    <span>{trades.length}</span>
                 </div>
                 <div className="flex justify-between text-sm text-slate-400 mt-1">
                    <span>Last Trade</span>
                    <span>{trades[0] ? new Date(trades[0].date).toLocaleDateString() : 'N/A'}</span>
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {isFormOpen && (
        <TradeForm 
          initialData={tradeToEdit}
          onSave={handleSaveTrade} 
          onClose={closeForm}
          currency={currency}
          dailyTradeCount={todayTradeCount}
          dailyTradeLimit={dailyTradeLimit}
        />
      )}

      {/* Funds Modal */}
      {isFundsModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
             <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl p-6">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-emerald-500" /> Manage Funds
                    </h3>
                    <button onClick={() => setIsFundsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                 </div>
                 
                 <div className="bg-slate-800 p-4 rounded-lg mb-6 text-center">
                    <p className="text-xs text-slate-400 uppercase font-medium">Net Deposits</p>
                    <p className="text-2xl font-bold text-white mt-1">{currency}{initialCapital.toLocaleString()}</p>
                 </div>

                 <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Amount</label>
                        <input 
                            type="number" 
                            value={transactionAmount}
                            onChange={(e) => setTransactionAmount(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none text-lg font-medium"
                            placeholder="0.00"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={handleDeposit}
                            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-medium transition-colors"
                        >
                            <ArrowUpCircle className="w-5 h-5" /> Deposit
                        </button>
                        <button 
                            onClick={handleWithdraw}
                            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-medium transition-colors"
                        >
                            <ArrowDownCircle className="w-5 h-5" /> Withdraw
                        </button>
                    </div>
                 </div>
             </div>
          </div>
      )}

      {/* Risk Settings Modal */}
      {isSettingsModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
             <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl p-6">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-500" /> Risk Controls
                    </h3>
                    <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                 </div>
                 
                 <div className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-slate-300">Daily Trade Limit</label>
                            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">0 = Unlimited</span>
                        </div>
                        <input 
                            type="number" 
                            value={dailyTradeLimit}
                            onChange={(e) => setDailyTradeLimit(parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            Set a hard limit on the number of trades you can take per day. We will warn you if you try to exceed this.
                        </p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Account Currency</label>
                        <div className="grid grid-cols-4 gap-2">
                            {CURRENCIES.map(c => (
                                <button
                                    key={c.code}
                                    onClick={() => setCurrency(c.symbol)}
                                    className={`p-2 rounded border text-sm font-medium ${
                                        currency === c.symbol 
                                        ? 'bg-blue-600 border-blue-600 text-white' 
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                                >
                                    {c.code}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setIsSettingsModalOpen(false)}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors"
                    >
                        Save Settings
                    </button>
                 </div>
             </div>
          </div>
      )}
    </div>
  );
};

// Simple helper icon
const X = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default App;