import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, ShoppingBag, Wallet, Mail, MoreHorizontal, Mail as MailIcon, Phone, Zap, FileText, CheckCircle2 } from 'lucide-react';

const RightPanel = () => {
  const [mounted, setMounted] = useState(false);
  const [activeContact, setActiveContact] = useState(1);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    setMounted(true);
    const fetchEmployees = async () => {
       try {
         const res = await axios.get('/api/employees');
         setEmployees(res.data);
       } catch (e) {
         console.error(e);
       }
    };
    fetchEmployees();
  }, []);

  const notifications = [
    { id: 1, icon: Zap, text: 'Phase 2 activated — Aryan Mehta', time: 'Just now', color: 'text-accent-primary' },
    { id: 2, icon: FileText, text: 'Daily report generated — 24 employees', time: '1h ago', color: 'text-text-primary' },
    { id: 3, icon: CheckCircle2, text: 'Agent 1 completed — Priya Sharma', time: '6h ago', color: 'text-accent-primary' },
    { id: 4, icon: Mail, text: 'Distraction report emailed to manager', time: 'Today', color: 'text-text-muted' },
  ];

  const activities = [
    { id: 1, action: 'New sequence folder assembled', time: 'Just now' },
    { id: 2, action: '203 app events logged today', time: '1h ago' },
    { id: 3, action: 'Idle threshold exceeded — Rahul Verma', time: '1 day ago' },
  ];

  return (
    <aside className="w-[300px] shrink-0 bg-base border-l border-border-subtle h-screen overflow-y-auto custom-scrollbar flex flex-col p-6 z-10">
      
      {/* Notifications */}
      <div className="mb-8">
        <h3 className="nav-section-label mb-4 px-0">Notifications</h3>
        <div className="flex flex-col gap-4">
          {notifications.map((notif, i) => {
            const Icon = notif.icon;
            return (
              <div 
                key={notif.id} 
                className={`flex items-center gap-3 transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-9 h-9 rounded-full bg-card border border-border-card flex items-center justify-center shrink-0">
                  <Icon className={`w-4 h-4 ${notif.color || 'text-text-primary'}`} />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold text-text-primary truncate">{notif.text}</span>
                  <span className="text-xs text-text-muted mt-0.5">{notif.time}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="h-px bg-border-subtle w-full mb-8"></div>

      {/* Activities Timeline */}
      <div className="mb-8">
        <h3 className="nav-section-label mb-4 px-0">Recent Activities</h3>
        <div className="flex flex-col gap-0 relative pl-2">
          {/* Timeline Line */}
          <div className="absolute left-[15px] top-2 bottom-4 w-px bg-border-card"></div>
          
          {activities.map((act, i) => (
             <div 
              key={act.id} 
              className={`flex items-start gap-4 mb-4 relative transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
              style={{ transitionDelay: `${300 + (i * 100)}ms` }}
             >
               <div className="w-[11px] h-[11px] rounded-full bg-accent-primary ring-4 ring-base mt-1 relative z-10 shrink-0"></div>
               <div className="flex flex-col mt-[-2px]">
                 <span className="text-sm font-semibold text-text-primary">{act.action}</span>
                 <span className="text-xs text-text-muted mt-0.5">{act.time}</span>
               </div>
             </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-border-subtle w-full mb-8 mt-auto"></div>

      {/* Contacts */}
      <div>
        <h3 className="nav-section-label mb-4 px-0">Monitored Employees</h3>
        <div className="flex flex-col gap-1">
          {employees.slice(0, 5).map((contact, i) => {
            const isActive = activeContact === i;
            return (
              <div 
                key={contact.name}
                onClick={() => setActiveContact(i)}
                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 ${isActive ? 'bg-accent-primary' : 'hover:bg-card-hover'} ${mounted ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: `${600 + (i * 50)}ms` }}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${isActive ? 'bg-base text-accent-primary border-transparent' : 'bg-card border-border-card text-text-primary'}`}>
                    {contact.name[0]}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className={`text-sm font-semibold leading-tight truncate ${isActive ? 'text-base' : 'text-text-primary'}`}>{contact.name}</span>
                    <span className={`text-[11px] leading-tight mt-0.5 truncate ${isActive ? 'text-base/70' : 'text-text-muted'}`}>
                       {contact.phase === 2 ? 'Phase 2 (Visual)' : 'Phase 1 (Metadata)'}
                    </span>
                  </div>
                </div>
                
                <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ${isActive ? 'opacity-100 text-base' : 'text-text-muted'}`}>
                  <button className="p-1.5 hover:bg-black/10 rounded-md transition-colors"><MailIcon className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 hover:bg-black/10 rounded-md transition-colors"><Phone className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </aside>
  );
};

export default RightPanel;
