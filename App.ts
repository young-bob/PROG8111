import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Mic, 
  Plus, 
  Home, 
  List, 
  PieChart, 
  Settings, 
  Menu, 
  ChevronLeft, 
  Save, 
  Trash2, 
  Smartphone,
  Cloud,
  Database,
  ArrowRight,
  ScanText,
  User,
  Bell,
  ShieldCheck,
  CircleHelp,
  TrendingUp,
  TrendingDown,
  Battery,
  Wifi,
  Signal,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';

// --- 模拟数据 (Mock Data) ---
const MOCK_DATA = [
  { id: '1', title: 'Monthly Salary', amount: 5000.0, category: 'Salary', date: '2026-04-01', type: 'Income' },
  { id: '2', title: 'Lunch - Hotpot', amount: 158.5, category: 'Food', date: '2026-04-01', type: 'Expense' },
  { id: '3', title: 'Supermarket', amount: 89.0, category: 'Shopping', date: '2026-04-01', type: 'Expense' },
  { id: '4', title: 'Stock Dividend', amount: 200.0, category: 'Invest', date: '2026-03-31', type: 'Income' },
  { id: '5', title: 'Cinema Tickets', amount: 45.0, category: 'Fun', date: '2026-03-30', type: 'Expense' },
];

const EXPENSE_CATEGORIES = ['Food', 'Shopping', 'Transport', 'Fun', 'Bills', 'Others'];
const INCOME_CATEGORIES = ['Salary', 'Invest', 'Gift', 'Bonus', 'Freelance', 'Others'];

// --- 通用卡片组件 ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm p-4 ${className}`}>{children}</div>
);

// --- 状态栏与遮罩组件 ---

const StatusBar = ({ time }) => (
  <div className="flex justify-between items-center px-8 pt-4 pb-2 text-[12px] font-bold text-gray-800 relative z-50">
    <span>{time}</span>
    {/* 灵动岛模拟 */}
    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-full z-50 pointer-events-none"></div>
    <div className="flex items-center gap-1.5">
      <Signal size={14} strokeWidth={2.5} />
      <Wifi size={14} strokeWidth={2.5} />
      <Battery size={14} strokeWidth={2.5} className="-rotate-90" />
    </div>
  </div>
);

const LoadingOverlay = ({ text, icon: IconComponent }) => (
  <div className="absolute inset-0 bg-slate-950/95 z-[100] flex flex-col items-center justify-center text-white p-10 text-center animate-in zoom-in-95 duration-300 rounded-[3rem]">
    <div className="relative mb-12">
      <div className="absolute inset-0 w-28 h-28 border-4 border-emerald-500/20 rounded-full animate-ping"></div>
      <IconComponent size={72} className={text.includes('Scanning') ? "text-emerald-500" : "text-blue-500"} />
    </div>
    <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter flex items-center gap-2">
      <Sparkles className="text-amber-400" size={24} /> AI Processing
    </h3>
    <p className="text-gray-400 font-bold leading-relaxed text-sm">{text}</p>
  </div>
);

// --- 核心屏幕页面 ---

const Dashboard = ({ records, navigateTo, setIsScanning, setIsRecording }) => (
  <div className="flex flex-col gap-6 p-5 pb-32 animate-in fade-in duration-500">
    <div className="flex items-center gap-4 py-2">
      <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
        <Smartphone className="text-white" size={24} />
      </div>
      <div>
        <h2 className="text-xl font-black text-gray-800 leading-none tracking-tight text-emerald-600">Smart AI Tracker</h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Next-Gen AI Powered</p>
      </div>
    </div>

    <div className="bg-slate-900 rounded-[2.5rem] p-7 text-white shadow-2xl relative overflow-hidden border border-white/5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Total Balance</p>
      <h3 className="text-4xl font-black mb-8 tracking-tighter">$ 8,927.00</h3>
      
      <div className="flex gap-6 border-t border-white/10 pt-6">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase">Income</span>
          </div>
          <p className="font-black text-lg text-emerald-400">+$5.2k</p>
        </div>
        <div className="w-[1px] bg-white/10 h-10 self-center opacity-20"></div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown size={14} className="text-rose-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase">Expense</span>
          </div>
          <p className="font-black text-lg text-rose-400">-$1.5k</p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <button 
        onClick={() => { setIsScanning(true); setTimeout(() => { setIsScanning(false); navigateTo('Detail', { title: 'Coffee Receipt', amount: 4.5, type: 'Expense', category: 'Food' }); }, 2000); }}
        className="bg-white p-5 rounded-[2rem] border border-gray-100 flex flex-col items-center gap-3 active:scale-95 transition-transform shadow-sm"
      >
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
          <ScanText size={24} />
        </div>
        <span className="text-[10px] font-black uppercase text-gray-600 tracking-wider text-center leading-tight">AI Receipt<br/>Scan</span>
      </button>
      <button 
        onClick={() => { setIsRecording(true); setTimeout(() => { setIsRecording(false); navigateTo('Detail', { title: 'Voice Entry', amount: 25.0, type: 'Expense', category: 'Transport' }); }, 2000); }}
        className="bg-white p-5 rounded-[2rem] border border-gray-100 flex flex-col items-center gap-3 active:scale-95 transition-transform shadow-sm"
      >
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
          <Mic size={24} />
        </div>
        <span className="text-[10px] font-black uppercase text-gray-600 tracking-wider text-center leading-tight">AI Voice<br/>Record</span>
      </button>
    </div>

    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <h4 className="font-black text-gray-800 text-lg uppercase tracking-tight leading-none">Recent Activity</h4>
        <button onClick={() => navigateTo('List')} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">View All</button>
      </div>
      <div className="space-y-3">
        {records.slice(0, 3).map(item => (
          <div key={item.id} className="bg-white p-4 rounded-3xl border border-gray-50 flex justify-between items-center active:bg-gray-50 transition-colors shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${item.type === 'Income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {item.category ? item.category[0] : 'U'}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm leading-tight">{item.title}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{item.category} • {item.date}</p>
              </div>
            </div>
            <p className={`font-black text-sm ${item.type === 'Income' ? 'text-emerald-500' : 'text-gray-800'}`}>
              {item.type === 'Income' ? '+' : '-'} ${item.amount.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Analytics = () => (
  <div className="flex flex-col gap-6 p-5 pb-32 animate-in fade-in duration-500 overflow-y-auto">
    <div className="flex justify-between items-end mb-2">
      <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Analytics</h2>
      <div className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">April 2026</div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-emerald-50 border-emerald-100 border text-center">
        <div className="flex items-center gap-2 mb-2 justify-center">
          <div className="p-1.5 bg-white rounded-lg text-emerald-600 shadow-sm"><TrendingUp size={14}/></div>
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Savings Rate</span>
        </div>
        <p className="text-2xl font-black text-emerald-800 leading-none">68.4%</p>
        <div className="flex items-center gap-1 mt-2 text-emerald-600/60 font-bold text-[9px] uppercase justify-center">
          <ArrowUpRight size={10}/> 4.2% from Mar
        </div>
      </Card>
      <Card className="bg-rose-50 border-rose-100 border text-center">
        <div className="flex items-center gap-2 mb-2 justify-center">
          <div className="p-1.5 bg-white rounded-lg text-rose-600 shadow-sm"><TrendingDown size={14}/></div>
          <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Burn Rate</span>
        </div>
        <p className="text-2xl font-black text-rose-800 leading-none">31.6%</p>
        <div className="flex items-center gap-1 mt-2 text-rose-600/60 font-bold text-[9px] uppercase justify-center">
          <ArrowDownRight size={10}/> 1.5% from Mar
        </div>
      </Card>
    </div>

    <Card className="flex flex-col items-center py-8 relative overflow-hidden">
      <h4 className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] mb-8">AI-Categorized Breakdown</h4>
      <div className="relative w-48 h-48 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="12" />
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray="180 251.2" />
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="12" strokeDasharray="45 251.2" strokeDashoffset="-180" />
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="12" strokeDasharray="26.2 251.2" strokeDashoffset="-225" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[10px] font-black text-gray-300 uppercase leading-none mb-1 tracking-widest">Spent</p>
          <p className="text-2xl font-black text-gray-800 leading-none">$1,574</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-y-4 gap-x-8 w-full px-4">
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Food (55%)
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div> Shop (18%)
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div> Fun (12%)
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
          <div className="w-3 h-3 rounded-full bg-gray-200"></div> Other (15%)
        </div>
      </div>
    </Card>

    <Card className="p-6">
      <h4 className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] mb-8">Weekly Activity</h4>
      <div className="flex items-end justify-between h-32 px-2 border-b border-gray-50 pb-2">
        {[
          { day: 'M', h: 45 }, { day: 'T', h: 85 }, { day: 'W', h: 60 },
          { day: 'T', h: 100 }, { day: 'F', h: 75 }, { day: 'S', h: 40 }, { day: 'S', h: 55 }
        ].map((bar, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div 
              className={`w-6 rounded-t-lg transition-all duration-500 ${bar.h === 100 ? 'bg-emerald-600 shadow-lg shadow-emerald-100' : 'bg-emerald-100 hover:bg-emerald-200'}`} 
              style={{ height: `${bar.h}px` }}
            ></div>
            <span className="text-[10px] font-black text-gray-400">{bar.day}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 mt-6 p-3 bg-gray-50 rounded-2xl">
        <Target size={16} className="text-emerald-500" />
        <p className="text-[10px] font-bold text-gray-500">Your spending is <span className="text-emerald-600 font-black">12% lower</span> than last week.</p>
      </div>
    </Card>
  </div>
);

const DetailView = ({ editingRecord, navigateTo }) => {
  const [type, setType] = useState(editingRecord?.type || 'Expense');
  const [title, setTitle] = useState(editingRecord?.title || '');
  const [amount, setAmount] = useState(editingRecord?.amount?.toString() || '');
  const [category, setCategory] = useState(editingRecord?.category || (type === 'Expense' ? 'Food' : 'Salary'));

  const categories = type === 'Expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-bottom duration-300 z-[60] absolute inset-0 rounded-[3rem] overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50 pt-12 bg-white/80 backdrop-blur-md z-10 sticky top-0">
        <button onClick={() => navigateTo('Home')} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronLeft size={24}/></button>
        <span className="font-black uppercase tracking-widest text-xs">Entry Details</span>
        <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"><Trash2 size={20}/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* 收支切换 */}
        <div className="flex bg-gray-100 p-1.5 rounded-[1.5rem] relative h-14">
          <div className={`absolute top-1.5 bottom-1.5 w-[48%] bg-white rounded-2xl shadow-sm transition-transform duration-300 ${type === 'Income' ? 'translate-x-[104%]' : 'translate-x-0'}`}></div>
          <button onClick={() => { setType('Expense'); setCategory('Food'); }} className={`flex-1 z-10 text-[10px] font-black uppercase tracking-widest transition-colors ${type === 'Expense' ? 'text-rose-600' : 'text-gray-400'}`}>Expense</button>
          <button onClick={() => { setType('Income'); setCategory('Salary'); }} className={`flex-1 z-10 text-[10px] font-black uppercase tracking-widest transition-colors ${type === 'Income' ? 'text-emerald-600' : 'text-gray-400'}`}>Income</button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">Enter Amount</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black ${type === 'Income' ? 'text-emerald-500' : 'text-rose-500'}`}>$</span>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-6xl font-black text-center outline-none w-48 border-b-4 border-gray-50 focus:border-emerald-500 transition-colors pb-2"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block text-center">AI Tag / Description</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-50 p-5 rounded-[1.5rem] font-bold outline-none border-2 border-transparent focus:border-emerald-100 transition-all text-sm" placeholder="e.g. Starbucks" />
          </div>
          <div>
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 block text-center">Category</label>
            <div className="grid grid-cols-3 gap-3">
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-tighter transition-all ${category === cat ? (type === 'Income' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-rose-600 text-white shadow-lg') : 'bg-gray-50 text-gray-400'}`}>{cat}</button>
              ))}
            </div>
          </div>
        </div>

        {/* 数据同步区块 - 恢复 */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-black text-blue-700 uppercase">Firebase Sync Enabled</span>
          </div>
          <div className="w-8 h-4 bg-blue-600 rounded-full relative">
            <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="p-6 pb-12 border-t border-gray-50 bg-white z-10 sticky bottom-0">
        <button onClick={() => navigateTo('Home')} className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-xl transition-all active:scale-95 ${type === 'Income' ? 'bg-emerald-600 shadow-emerald-100' : 'bg-rose-600 shadow-rose-100'} text-white flex items-center justify-center gap-3`}>
          <Save size={20}/> Confirm {type}
        </button>
      </div>
    </div>
  );
};

const HistoryScreen = ({ records, navigateTo }) => (
  <div className="p-5 pb-32 animate-in fade-in duration-500">
    <h2 className="text-xl font-black text-gray-800 mb-6 uppercase tracking-tight">History</h2>
    <div className="space-y-3">
      {records.map(item => (
        <div key={item.id} onClick={() => navigateTo('Detail', item)} className="bg-white p-4 rounded-3xl border border-gray-50 flex justify-between items-center active:scale-95 transition-transform cursor-pointer shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${item.type === 'Income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {item.category ? item.category[0] : 'U'}
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm leading-tight">{item.title}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{item.category} • {item.date}</p>
            </div>
          </div>
          <p className={`font-black text-sm ${item.type === 'Income' ? 'text-emerald-500' : 'text-gray-800'}`}>
            {item.type === 'Income' ? '+' : '-'} ${item.amount.toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  </div>
);

const SettingsScreen = () => {
  const settingsList = [
    { icon: User, label: 'Profile Settings' },
    { icon: Bell, label: 'Notifications' },
    { icon: ShieldCheck, label: 'Security' },
    { icon: CircleHelp, label: 'Support Center' }
  ];

  return (
    <div className="p-5 pb-32 animate-in fade-in duration-500">
      <h2 className="text-xl font-black text-gray-800 mb-6 uppercase tracking-tight">App Config</h2>
      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden divide-y divide-gray-50 shadow-sm">
        {settingsList.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-5 flex items-center justify-between active:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4 text-gray-500">
                <Icon size={18} />
                <span className="text-xs font-bold text-gray-700 tracking-tight">{item.label}</span>
              </div>
              <ArrowRight size={14} className="text-gray-200" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MainDrawer = ({ currentScreen, navigateTo, setIsDrawerOpen }) => {
  const navList = [
    { id: 'Home', icon: Home, label: 'Dashboard' },
    { id: 'List', icon: List, label: 'History' },
    { id: 'Stats', icon: PieChart, label: 'Analytics' },
    { id: 'Settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      <div className="absolute inset-0 bg-slate-900/60 z-[60] backdrop-blur-sm animate-in fade-in duration-300 rounded-[3rem]" onClick={() => setIsDrawerOpen(false)}></div>
      <div className="absolute left-0 top-0 bottom-0 w-72 bg-white z-[70] p-8 animate-in slide-in-from-left duration-400 flex flex-col rounded-r-[3rem] rounded-l-[3rem] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-4 mb-12 mt-10 pt-8">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"><Smartphone className="text-white" size={24} /></div>
          <div><h4 className="font-black text-gray-800 leading-none tracking-tight">Smart AI Tracker</h4><p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Group Project W26</p></div>
        </div>
        <nav className="flex-1 space-y-2">
          {navList.map(nav => {
            const Icon = nav.icon;
            return (
              <button
                key={nav.id}
                onClick={() => { navigateTo(nav.id); setIsDrawerOpen(false); }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all ${currentScreen === nav.id ? 'bg-slate-900 text-white shadow-xl translate-x-2' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <Icon size={18} /> <span>{nav.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 存储状态区块 - 恢复 */}
        <div className="p-5 bg-emerald-50 rounded-[2rem] border border-emerald-100 mt-auto mb-4">
          <p className="text-[9px] font-black text-emerald-600 uppercase mb-3 tracking-widest text-center">Storage Engine</p>
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <Database size={12} className="text-emerald-700"/>
            <span className="text-[10px] font-bold text-emerald-800">SQLite: Local Active</span>
          </div>
          <div className="flex items-center gap-2 opacity-70">
            <Cloud size={12} className="text-blue-600"/>
            <span className="text-[10px] font-bold text-blue-800">Firebase: Remote Cloud</span>
          </div>
        </div>
      </div>
    </>
  );
};

// --- App 主框架 ---

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [records, setRecords] = useState(MOCK_DATA);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navigateTo = (screen, params = null) => {
    if (params) setEditingRecord(params);
    setCurrentScreen(screen);
  };

  return (
    <div className="w-full max-w-md mx-auto h-[844px] bg-white overflow-hidden relative shadow-2xl rounded-[3rem] border-[8px] border-[#3a3a3c] mt-4 flex flex-col font-sans select-none ring-1 ring-black/5">
      <StatusBar time={time} />
      
      {currentScreen !== 'Detail' && (
        <div className="flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-40 pt-8">
          <button onClick={() => setIsDrawerOpen(true)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <Menu size={24} className="text-gray-600" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] leading-none mb-1 text-center">AI Tracker</span>
            <span className="text-sm font-bold text-gray-800">{currentScreen === 'Home' ? 'Dashboard' : currentScreen === 'Stats' ? 'Analytics' : currentScreen}</span>
          </div>
          <button onClick={() => navigateTo('Settings')} className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm active:scale-95 transition-transform">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
          </button>
        </div>
      )}

      <main className="flex-1 overflow-y-auto relative bg-white rounded-[3rem]">
        {currentScreen === 'Home' && (
          <Dashboard 
            records={records} 
            navigateTo={navigateTo} 
            setIsScanning={setIsScanning} 
            setIsRecording={setIsRecording} 
          />
        )}
        {currentScreen === 'Stats' && <Analytics />}
        {currentScreen === 'List' && (
          <HistoryScreen records={records} navigateTo={navigateTo} />
        )}
        {currentScreen === 'Settings' && <SettingsScreen />}
        {currentScreen === 'Detail' && (
          <DetailView editingRecord={editingRecord} navigateTo={navigateTo} />
        )}
      </main>

      {currentScreen !== 'Detail' && (
        <div className="absolute bottom-6 left-6 right-6 h-20 bg-slate-900 shadow-2xl rounded-[2.5rem] flex justify-around items-center px-4 z-50 border border-white/10">
          {[
            { id: 'Home', icon: Home },
            { id: 'List', icon: List },
            { id: 'Add', icon: Plus, special: true },
            { id: 'Stats', icon: PieChart },
            { id: 'Settings', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            return tab.special ? (
              <button
                key={tab.id}
                onClick={() => navigateTo('Detail', { title: '', amount: 0, type: 'Expense' })}
                className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white -mt-12 shadow-xl shadow-emerald-500/40 active:scale-90 transition-all border-[4px] border-slate-900"
              >
                <Plus size={28} strokeWidth={3} />
              </button>
            ) : (
              <button
                key={tab.id}
                onClick={() => navigateTo(tab.id)}
                className={`p-3 rounded-2xl transition-all ${currentScreen === tab.id ? 'text-emerald-400 bg-white/10' : 'text-gray-400 hover:text-white'}`}
              >
                <Icon size={22} />
              </button>
            );
          })}
        </div>
      )}

      {isDrawerOpen && (
        <MainDrawer 
          currentScreen={currentScreen} 
          navigateTo={navigateTo} 
          setIsDrawerOpen={setIsDrawerOpen} 
        />
      )}

      {(isScanning || isRecording) && (
        <LoadingOverlay 
          text={isScanning ? 'AI is currently extracting receipt data via multimodal vision analysis...' : 'Processing natural language voice input for smart categorization...'} 
          icon={isScanning ? ScanText : Mic} 
        />
      )}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-black/20 rounded-full z-50"></div>
    </div>
  );
};

export default App;