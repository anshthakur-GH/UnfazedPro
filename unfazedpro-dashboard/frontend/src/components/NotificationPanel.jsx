import React from 'react'

const NotificationItem = ({ title, time, type }) => (
  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
    <div style={{
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: type === 'report' ? '#444' : 'var(--accent-green)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      fontWeight: '700'
    }}>
      {type === 'report' ? '📄' : '✓'}
    </div>
    <div>
      <div style={{ fontSize: '12px', fontWeight: '500', lineHeight: '1.4' }}>{title}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{time}</div>
    </div>
  </div>
)

const NotificationPanel = () => {
  return (
    <div style={{
      width: 'var(--right-panel-width)',
      background: 'var(--bg-right-panel)',
      borderLeft: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px'
    }}>
      <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>Notifications</div>
      <NotificationItem title="Phase 2 activated for Aryan Mehta." time="Just now" />
      <NotificationItem title="Daily report generated — 24 employees." time="1 hour ago" type="report" />
      <NotificationItem title="Agent 1 completed for Priya Sharma." time="6 hours ago" />
      <NotificationItem title="Distraction report emailed to manager." time="Today, 11:59 PM" />

      <div style={{ fontSize: '13px', fontWeight: '600', marginTop: '32px', marginBottom: '20px' }}>Activities</div>
      <NotificationItem title="New sequence folder assembled." time="Just now" type="report" />
      <NotificationItem title="203 app events logged today." time="47 minutes ago" />
      <NotificationItem title="Idle threshold exceeded — Rahul Verma." time="1 day ago" />

      <div style={{ fontSize: '13px', fontWeight: '600', marginTop: '32px', marginBottom: '20px' }}>Monitored Employees</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {['Aryan Mehta', 'Priya Sharma', 'Rahul Verma', 'Deepa Nair'].map((name, i) => (
          <div key={name} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px',
            borderRadius: '8px',
            background: i === 2 ? 'var(--accent-green)' : 'transparent',
            color: i === 2 ? 'var(--bg-primary)' : 'var(--text-primary)'
          }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#444', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{name[0]}</div>
            <div style={{ fontSize: '12px', fontWeight: '500' }}>{name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotificationPanel
