import React, { useState, useEffect } from 'react';
import { Search, LayoutDashboard, BarChart3, Users, Settings, CreditCard, ChevronDown, ChevronRight, Hexagon } from 'lucide-react';

const SidebarPremium = () => {
  const [mounted, setMounted] = useState(false);
  const [activeItem, setActiveItem] = useState('Overview');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'Analytics', icon: BarChart3 },
    { label: 'Employees', icon: Users },
  ];

  return (
    <aside className="w-[220px] shrink-0 bg-sidebar border-r border-border-subtle h-screen flex flex-col pt-6 pb-6 animate-fade-in relative z-20">
      {/* User Profile */}
      <div className={`flex items-center gap-3 px-5 mb-8 transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <img 
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=FF7300" 
          alt="User avatar" 
          className="w-8 h-8 rounded-full border border-border-card"
        />
        <div className="flex flex-col">
          <span className="text-text-primary text-sm font-semibold leading-tight">Admin</span>
          <span className="text-text-muted text-[11px] leading-tight mt-0.5">UnfazedPro</span>
        </div>
      </div>

      {/* Search */}
      <div className={`px-5 mb-8 transition-all duration-500 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="relative group cursor-pointer">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-muted group-hover:text-text-secondary transition-colors" />
          </div>
          <div className="bg-card w-full h-9 rounded-lg border border-border-card flex items-center justify-between pr-2 pl-9 group-hover:border-border-subtle transition-colors">
            <span className="text-text-muted text-sm group-hover:text-text-secondary transition-colors">Search</span>
            <span className="bg-base border border-border-subtle text-text-muted text-[10px] font-mono px-1.5 py-0.5 rounded shadow-sm">⌘K</span>
          </div>
        </div>
      </div>

      {/* Nav Section 1 */}
      <div className={`flex flex-col px-2 mb-6 transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <span className="nav-section-label">Dashboards</span>
        <div className="flex flex-col gap-1 relative">
          {navItems.map((item) => {
            const isActive = activeItem === item.label;
            const Icon = item.icon;
            return (
              <div 
                key={item.label}
                onClick={() => setActiveItem(item.label)}
                className={`nav-item relative z-10 ${isActive ? 'text-base font-semibold' : 'text-text-secondary hover:text-text-primary hover:bg-card-hover'}`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-accent-primary rounded-lg -z-10" />
                )}
                <Icon className={`w-4 h-4 ${isActive ? 'text-base' : ''}`} />
                <span className={isActive ? 'text-base' : ''}>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nav Section 2 - Collapsible */}
      <div className={`flex flex-col px-2 flex-grow transition-all duration-500 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <span className="nav-section-label">Settings</span>
        <div className="flex flex-col gap-1">
          <div 
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="nav-item hover:bg-card-hover justify-between"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4" />
              <span>Workspace</span>
            </div>
            {settingsOpen ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
          </div>
          
          <div className={`overflow-hidden transition-all duration-200 ${settingsOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-col gap-1 pl-10 pr-2 pt-1">
              <div className="text-sm text-text-muted hover:text-text-primary py-1.5 cursor-pointer transition-colors">General</div>
              <div className="text-sm text-text-muted hover:text-text-primary py-1.5 cursor-pointer transition-colors">Team Members</div>
              <div className="text-sm text-text-muted hover:text-text-primary py-1.5 cursor-pointer transition-colors">Integrations</div>
            </div>
          </div>

          <div className="nav-item hover:bg-card-hover">
            <CreditCard className="w-4 h-4" />
            <span>Reports</span>
          </div>
        </div>
      </div>

      {/* Brand Logo Bottom */}
      <div className={`px-5 mt-auto transition-all duration-500 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 text-text-muted hover:text-text-primary cursor-pointer transition-colors">
          <img src="/Logo.png" alt="UnfazedPro Logo" className="w-5 h-5 object-contain" />
          <span className="font-semibold text-sm tracking-wide">UnfazedPro</span>
        </div>
      </div>
    </aside>
  );
};

export default SidebarPremium;
