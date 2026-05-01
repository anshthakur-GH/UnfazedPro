import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Moon, Sun, RefreshCcw, Bell, Globe, ChevronDown, TrendingUp, TrendingDown, MoreVertical, ArrowRight, ArrowUpDown, CircleDollarSign, Users2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useCountUp } from '../hooks/useCountUp';
import { useTheme } from '../context/ThemeContext';

const formatCurrency = (value) => {
  return '$' + value.toLocaleString();
};

const KPICard = ({ title, value, prefix = '', suffix = '', trend, trendLabel, valueColor }) => {
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const animatedValue = useCountUp(numValue, 1500);
  
  return (
    <div className="card-premium p-6 flex flex-col justify-between relative overflow-hidden group h-[160px]">
      <div className="flex justify-between items-start z-10">
        <span className="kpi-label whitespace-nowrap">{title}</span>
      </div>
      
      <div className="z-10 relative">
        <div className={`kpi-value text-4xl ${valueColor || 'text-text-primary'}`}>
          {prefix}{typeof value === 'number' ? animatedValue.toLocaleString() : value}{suffix}
        </div>
        
        {trend !== undefined && (
          <div className="flex items-center gap-1.5 text-xs font-semibold mt-1 text-accent-primary">
            {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trendLabel || `${Math.abs(trend)}% vs last month`}</span>
          </div>
        )}
      </div>

      {/* Subtle background element for decoration */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent-primary/5 blur-3xl rounded-full group-hover:bg-accent-primary/10 transition-colors"></div>
    </div>
  );
};

const MainContent = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  const [data, setData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [appData, setAppData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const [ov, emp, app, trend] = await Promise.all([
          axios.get('/api/overview'),
          axios.get('/api/employees'),
          axios.get('/api/activity-chart'),
          axios.get('/api/distraction-trend')
        ]);
        setData(ov.data);
        setEmployees(emp.data);
        setAppData(app.data.map((item, i) => ({
          ...item,
          color: i === 0 ? '#FF7300' : i === 1 ? '#FFAA00' : i === 2 ? '#CC5500' : '#993300'
        })));
        setTrendData(trend.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  if (!data) return <div className="p-8 text-accent-primary font-mono">LOADING INTELLIGENCE SYSTEM...</div>;

  return (
    <main className="flex-grow bg-base overflow-y-auto custom-scrollbar h-screen relative z-0 p-8 pt-6">
      
      {/* Header Row */}
      <div className={`flex justify-between items-center mb-8 transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Overview</h1>
          <button className="text-text-muted hover:text-warning transition-colors mt-1">
            <Star size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-2">
            <button 
              onClick={toggleTheme}
              className="p-2 text-text-muted hover:text-text-primary hover:bg-card-hover rounded-md transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="p-2 text-text-muted hover:text-text-primary hover:bg-card-hover rounded-md transition-colors" onClick={() => window.location.reload()}><RefreshCcw size={18} /></button>
            <button className="p-2 text-text-muted hover:text-text-primary hover:bg-card-hover rounded-md transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-danger rounded-full"></span>
            </button>
            <button className="p-2 text-text-muted hover:text-text-primary hover:bg-card-hover rounded-md transition-colors"><Globe size={18} /></button>
          </div>
          
          <button className="flex items-center gap-2 bg-card border border-border-card px-4 py-2 rounded-lg text-sm font-medium hover:border-border-subtle transition-colors">
            Today <ChevronDown size={16} className="text-text-muted" />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className={`grid grid-cols-4 gap-5 mb-6 transition-all duration-500 delay-100 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <KPICard title="EMPLOYEES MONITORED" value={data.active_employees} trend={1} trendLabel="↑ 3 since last month" />
        <KPICard title="AVG ACTIVE HOURS / DAY" value={`${data.avg_active_hours}h`} trend={1} trendLabel="↑ 8% vs last month" />
        <KPICard title="AVG DISTRACTION RATE" value={data.avg_distraction_pct} suffix="%" trend={-1} trendLabel="↓ 2.4% vs last week" valueColor="text-danger-dark" />
        <KPICard title="AUTOMATION PROPOSALS" value={data.proposals_generated} trend={1} trendLabel="↑ 2 this quarter" />
      </div>

      {/* Middle Dashboard Row */}
      <div className={`grid grid-cols-12 gap-5 mb-6 transition-all duration-500 delay-200 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        {/* App Events Overview */}
        <div className="col-span-6 card-premium p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-base font-bold text-text-primary">App Events Overview</h2>
            <button className="text-text-muted hover:text-text-primary"><MoreVertical size={18} /></button>
          </div>
          
          <div className="flex items-center">
            <div className="w-1/2 relative h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appData}
                    cx="50%"
                    cy="50%"
                    innerRadius={74}
                    outerRadius={88}
                    stroke="none"
                    paddingAngle={2}
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={1000}
                  >
                    {appData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-mono font-bold text-text-primary">{Math.round(data.avg_active_hours * 30 * 1500).toLocaleString()}</span>
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">MONTHLY EVENTS</span>
              </div>
            </div>
            
            <div className="w-1/2 pl-6">
              <div className="mb-6">
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-1">TOTAL APP EVENTS</span>
                <span className="text-xl font-mono font-bold text-text-primary">{(data.avg_active_hours * 100 * 30 * 10).toLocaleString()}</span>
              </div>
              
              <div className="flex flex-col gap-3">
                {appData.map(item => (
                  <div key={item.name} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-text-secondary">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-text-primary">{item.value}h</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mini Stats & Sparkline */}
        <div className="col-span-3 flex flex-col gap-5">
          <div className="card-premium p-5 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-card border border-border-card flex items-center justify-center shrink-0">
                <Users2 className="text-accent-primary w-5 h-5" />
              </div>
              <div>
                <span className="kpi-label block mb-1">PHASE 2 ACTIVE</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-bold text-text-primary">3</span>
                  <span className="text-xs font-semibold text-accent-primary">↑1 this week</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card-premium p-5 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-card border border-border-card flex items-center justify-center shrink-0">
                <CircleDollarSign className="text-accent-primary w-5 h-5" />
              </div>
              <div>
                <span className="kpi-label block mb-1">AVG ROI</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-bold text-text-primary">₹14.2k</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sparkline Area Chart */}
        <div className="col-span-3 card-premium p-6 flex flex-col relative overflow-hidden">
          <div className="z-10 mb-4">
            <span className="kpi-label block mb-1">DISTRACTION TREND</span>
            <span className="text-2xl font-mono font-bold text-text-primary">{data.avg_distraction_pct}% avg</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-32 w-full animate-draw-svg">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7300" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF7300" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#FF7300" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>

      {/* Bottom Row */}
      <div className={`grid grid-cols-12 gap-5 mb-8 transition-all duration-500 delay-300 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        {/* Employee Table */}
        <div className="col-span-8 card-premium overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border-card flex justify-between items-center">
            <h2 className="text-base font-bold text-text-primary">Employee List</h2>
            <button className="text-xs font-bold text-accent-primary hover:text-accent-secondary uppercase tracking-widest transition-colors flex items-center gap-1">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="table-header">
                    <div className="flex items-center gap-2">EMPLOYEE <ArrowUpDown size={12} className="opacity-50" /></div>
                  </th>
                  <th className="table-header text-right">
                    <div className="flex items-center justify-end gap-2">MONITORING LEVEL <ArrowUpDown size={12} className="opacity-50" /></div>
                  </th>
                  <th className="table-header text-right">
                    <div className="flex items-center justify-end gap-2">DISTRACTION RATE <ArrowUpDown size={12} className="opacity-50" /></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.name} className="hover:bg-card-hover transition-colors group cursor-pointer">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-card border border-border-card flex items-center justify-center text-[10px] font-bold">{emp.name[0]}</div>
                        <div>
                          <div className="font-semibold text-text-primary group-hover:text-accent-primary transition-colors">{emp.name}</div>
                          <div className="text-xs text-text-muted">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-right font-mono text-text-secondary text-xs">{emp.phase === 2 ? 'Phase 2 (Visual)' : 'Phase 1 (Metadata)'}</td>
                    <td className="table-cell text-right font-mono font-bold text-text-primary">{emp.distraction}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Premium CTA */}
        <div className="col-span-4 rounded-[14px] p-6 flex flex-col justify-center relative overflow-hidden" style={{ background: 'radial-gradient(circle at top right, rgba(255,115,0,0.15) 0%, rgba(22,22,22,1) 70%)', border: '1px solid var(--border-card)' }}>
          <div className="z-10">
            <span className="inline-block px-2.5 py-1 bg-accent-primary/10 text-accent-primary border border-accent-primary/20 rounded-full text-xs font-bold mb-4">AGENT 2 READY</span>
            <div className="mb-2">
              <span className="text-4xl font-mono font-bold text-text-primary">Run Analysis</span>
            </div>
            <p className="text-text-secondary text-sm mb-6 leading-relaxed">
              Aryan Mehta · {Math.round(data.avg_active_hours * 120)} sequences captured
            </p>
            <button className="w-full bg-accent-primary hover:bg-[#FF8800] text-base font-bold py-3 px-4 rounded-full transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(255,115,0,0.3)]">
              Run Agent 2 Now
            </button>
          </div>
          {/* Subtle bg glow */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-primary/10 blur-[50px] rounded-full pointer-events-none"></div>
        </div>

      </div>
    </main>
  );
};

export default MainContent;
