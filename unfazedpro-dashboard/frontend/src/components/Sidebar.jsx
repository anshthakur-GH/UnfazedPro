import React from 'react'
import { LayoutGrid, Users, BarChart3, ShieldAlert, FileText, History, Settings, HelpCircle, Search } from 'lucide-react'

const SidebarItem = ({ icon: Icon, label, active }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    background: active ? 'var(--accent-green)' : 'transparent',
    color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
    marginBottom: '4px',
    fontWeight: active ? '600' : '400'
  }}>
    <Icon size={18} />
    <span>{label}</span>
  </div>
)

const Sidebar = () => {
  return (
    <div style={{
      width: 'var(--sidebar-width)',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
        <div style={{ width: '32px', height: '32px', background: 'var(--accent-green)', borderRadius: '6px' }}></div>
        <span style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px' }}>UnfazedPro</span>
      </div>

      <div style={{
        background: 'var(--bg-tertiary)',
        padding: '8px 12px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '24px'
      }}>
        <Search size={14} color="var(--text-muted)" />
        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Search...</span>
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '10px' }}>⌘K</span>
      </div>

      <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Dashboards</div>
      <SidebarItem icon={LayoutGrid} label="Overview" active />
      <SidebarItem icon={Users} label="Employees" />
      <SidebarItem icon={BarChart3} label="Analytics" />
      <SidebarItem icon={ShieldAlert} label="Agents" />

      <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', marginTop: '24px' }}>Settings</div>
      <SidebarItem icon={FileText} label="Reports" />
      <SidebarItem icon={History} label="Audit Log" />
      <SidebarItem icon={Settings} label="Settings" />
      <SidebarItem icon={HelpCircle} label="Help Centre" />

      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ color: 'var(--accent-green)', fontWeight: '800', fontSize: '14px' }}>◌◌◌</div>
        <span style={{ fontWeight: '700', fontSize: '12px' }}>UNFAZEDPRO</span>
      </div>
    </div>
  )
}

export default Sidebar
