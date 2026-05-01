import React from 'react'
import { LayoutGrid, Users, BarChart3, ShieldAlert, FileText, History, Settings, HelpCircle, Search } from 'lucide-react'

const SidebarItem = ({ icon: Icon, label, active }) => (
  <div style={{
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
    marginBottom: '4px',
    fontWeight: active ? '600' : '400',
    transition: 'color 0.2s'
  }}>
    {active && (
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 115, 0, 0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 115, 0, 0.2)',
        zIndex: 0
      }} />
    )}
    <Icon size={18} style={{ zIndex: 1, color: active ? 'var(--accent-primary)' : 'inherit' }} />
    <span style={{ zIndex: 1, fontSize: '14px' }}>{label}</span>
  </div>
)

const Sidebar = () => {
  return (
    <div style={{
      width: 'var(--sidebar-width)',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      height: '100vh'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingLeft: '8px' }}>
        <div style={{ 
          width: '36px', 
          height: '36px', 
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', 
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(255, 115, 0, 0.3)'
        }}>
           <span style={{ color: '#000', fontWeight: '800', fontSize: '18px' }}>U</span>
        </div>
        <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>UnfazedPro</span>
      </div>

      <div style={{
        background: 'var(--bg-base)',
        padding: '10px 14px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '32px',
        border: '1px solid var(--border-subtle)'
      }}>
        <Search size={16} color="var(--text-muted)" />
        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Search...</span>
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '700' }}>⌘K</span>
      </div>

      <div className="section-label" style={{ marginBottom: '16px', paddingLeft: '8px' }}>Platform</div>
      <SidebarItem icon={LayoutGrid} label="Dashboard" active />
      <SidebarItem icon={Users} label="Employees" />
      <SidebarItem icon={BarChart3} label="Analytics" />
      <SidebarItem icon={ShieldAlert} label="AI Agents" />

      <div className="section-label" style={{ marginBottom: '16px', marginTop: '32px', paddingLeft: '8px' }}>Intelligence</div>
      <SidebarItem icon={FileText} label="Reports" />
      <SidebarItem icon={History} label="Audit Log" />
      <SidebarItem icon={Settings} label="Settings" />

      <div style={{ marginTop: 'auto', padding: '16px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '4px' }}>PRO SYSTEM</div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Enterprise Monitoring Active</div>
      </div>
    </div>
  )
}

export default Sidebar
