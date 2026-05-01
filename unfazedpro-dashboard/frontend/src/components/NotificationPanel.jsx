import React from 'react'
import { Bell, Zap, FileText, CheckCircle2, Activity, Package, Mail, Phone } from 'lucide-react'

const NotificationItem = ({ title, time, type, icon: Icon }) => (
  <div style={{ display: 'flex', gap: '14px', marginBottom: '24px' }}>
    <div style={{
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      background: type === 'urgent' ? 'rgba(255, 115, 0, 0.1)' : 'var(--bg-base)',
      border: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: type === 'urgent' ? 'var(--accent-primary)' : 'var(--text-muted)'
    }}>
      <Icon size={18} />
    </div>
    <div>
      <div style={{ fontSize: '13px', fontWeight: '500', lineHeight: '1.4', color: 'var(--text-primary)' }}>{title}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>{time}</div>
    </div>
  </div>
)

const NotificationPanel = () => {
  return (
    <div style={{
      width: 'var(--right-panel-width)',
      background: 'var(--bg-sidebar)',
      borderLeft: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 20px',
      height: '100vh',
      overflowY: 'auto'
    }}>
      <div className="section-label" style={{ marginBottom: '24px' }}>Live Updates</div>
      <NotificationItem title="Phase 2 activated for Aryan Mehta." time="JUST NOW" icon={Zap} type="urgent" />
      <NotificationItem title="Daily report generated (24 staff)." time="1 HOUR AGO" icon={FileText} />
      <NotificationItem title="Audit completed for Priya Sharma." time="6 HOURS AGO" icon={CheckCircle2} />

      <div className="section-label" style={{ marginBottom: '24px', marginTop: '40px' }}>System Logs</div>
      <NotificationItem title="New sequence folder assembled." time="JUST NOW" icon={Package} />
      <NotificationItem title="203 app events logged today." time="47 MIN AGO" icon={Activity} />

      <div className="section-label" style={{ marginBottom: '24px', marginTop: '40px' }}>Monitored Talent</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {['Aryan Mehta', 'Priya Sharma', 'Rahul Verma', 'Deepa Nair'].map((name, i) => (
          <div key={name} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '12px',
            background: i === 2 ? 'var(--accent-primary)' : 'transparent',
            color: i === 2 ? '#000' : 'var(--text-primary)',
            transition: 'all 0.2s',
            cursor: 'pointer',
            border: i === 2 ? 'none' : '1px solid transparent'
          }}>
            <div style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '8px', 
              background: i === 2 ? 'rgba(0,0,0,0.1)' : 'var(--bg-card)', 
              fontSize: '11px', 
              fontWeight: '800',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>{name[0]}</div>
            <div style={{ fontSize: '13px', fontWeight: '600', flex: 1 }}>{name}</div>
            {i === 2 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Mail size={14} />
                <Phone size={14} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '32px' }}>
         <div className="premium-card" style={{ padding: '20px', background: 'var(--bg-base)', textAlign: 'center' }}>
            <div className="section-label" style={{ marginBottom: '8px' }}>Connection Status</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
               <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a8ff3e', boxShadow: '0 0 8px #a8ff3e' }}></div>
               <span style={{ fontSize: '12px', fontWeight: '700' }}>SECURE LINK</span>
            </div>
         </div>
      </div>
    </div>
  )
}

export default NotificationPanel
