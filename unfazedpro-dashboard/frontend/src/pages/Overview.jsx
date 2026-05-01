import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { TrendingUp, TrendingDown, MoreVertical, RefreshCw, Moon, Bell, Globe, ChevronDown, Zap, Settings } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts'

const MetricCard = ({ label, value, delta, deltaUp, gauge }) => (
  <div className="premium-card" style={{ padding: '24px', flex: 1 }}>
    <div className="section-label" style={{ marginBottom: '12px' }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div className="metric-kpi">{value}</div>
      {gauge && (
        <div style={{ width: '44px', height: '44px' }}>
          <svg viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--accent-primary)" strokeWidth="3" strokeDasharray={`${gauge}, 100`} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 4px var(--accent-primary))' }} />
          </svg>
        </div>
      )}
    </div>
    <div style={{ 
      marginTop: '16px', 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '6px', 
      padding: '4px 8px', 
      background: 'rgba(0,0,0,0.3)', 
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: '600',
      color: deltaUp ? '#a8ff3e' : '#ff4444' 
    }}>
      {deltaUp ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
      {delta}
    </div>
  </div>
)

const Overview = () => {
  const [data, setData] = useState(null)
  const [employees, setEmployees] = useState([])
  const [appData, setAppData] = useState([])
  const [trendData, setTrendData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ov, emp, app, trend] = await Promise.all([
          axios.get('/api/overview'),
          axios.get('/api/employees'),
          axios.get('/api/activity-chart'),
          axios.get('/api/distraction-trend')
        ])
        setData(ov.data)
        setEmployees(emp.data)
        setAppData(app.data)
        setTrendData(trend.data)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000) // Poll every 5 seconds
    
    return () => clearInterval(interval)
  }, [])

  if (!data) return <div style={{ padding: '40px', color: 'var(--accent-primary)', fontWeight: '700', fontFamily: 'Space Mono' }}>BOOTING UNFAZEDPRO OS...</div>

  return (
    <div style={{ padding: '32px' }}>
      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>DASHBOARDS / OVERVIEW</div>
          <h1 className="page-title">Intelligence Overview</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-subtle)', cursor: 'pointer', fontSize: '13px' }}>
            Last 30 Days <ChevronDown size={14} />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
             <RefreshCw size={18} className="hover:text-white cursor-pointer transition-colors" />
             <Bell size={18} className="hover:text-white cursor-pointer transition-colors" />
             <Settings size={18} className="hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <MetricCard label="Employees Monitored" value={data.active_employees} delta="↑ 3 since last month" deltaUp />
        <MetricCard label="Avg Active Hours / Day" value={`${data.avg_active_hours}h`} delta="↑ 8% vs last month" deltaUp />
        <MetricCard label="Avg Distraction Rate" value={`${data.avg_distraction_pct}%`} gauge={data.avg_distraction_pct} delta="↓ 2.4% vs last week" deltaUp={false} />
        <MetricCard label="Automation Proposals" value={data.proposals_generated} delta="↑ 2 this quarter" deltaUp />
        <MetricCard label="ROI Expected" value="44%" delta="↑ 12% projected" deltaUp />
      </div>

      {/* Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px', marginBottom: '32px' }}>
        <div className="premium-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div style={{ fontSize: '16px', fontWeight: '700' }}>Behavioral Distribution</div>
            <MoreVertical size={16} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
            <div style={{ width: '220px', height: '220px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={appData} innerRadius={70} outerRadius={95} paddingAngle={4} dataKey="value" stroke="none">
                    {appData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--accent-primary)' : `rgba(255, 115, 0, ${0.7 - index * 0.15})`} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div className="metric-font" style={{ fontSize: '24px', fontWeight: '700' }}>{Math.round(data.avg_active_hours * 30)}h</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Monthly Total</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
               <div style={{ background: 'var(--bg-base)', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid var(--border-subtle)' }}>
                  <div className="section-label" style={{ marginBottom: '8px' }}>Peak Productivity Window</div>
                  <div className="metric-font" style={{ fontSize: '18px', fontWeight: '700' }}>09:45 AM - 01:20 PM</div>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {appData.map((app, i) => (
                    <div key={app.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{app.name}</span>
                      <span className="metric-font" style={{ fontWeight: '700' }}>{app.value}h</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <div className="premium-card" style={{ padding: '24px', flex: 1 }}>
              <div className="section-label" style={{ marginBottom: '16px' }}>Performance Trends</div>
              <div style={{ height: '140px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>
           
           <div className="premium-card mesh-gradient" style={{ padding: '28px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px', background: 'rgba(255,115,0,0.1)', borderRadius: '12px', border: '1px solid rgba(255,115,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={20} color="var(--accent-primary)" fill="var(--accent-primary)" />
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Agent 2 Proposed</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
                Automation workflow ready for <strong>Aryan Mehta</strong>. Potential ROI: ₹18,400/mo.
              </div>
              <button style={{ 
                width: '100%', 
                background: 'var(--accent-primary)', 
                border: 'none', 
                borderRadius: '30px', 
                padding: '14px', 
                fontWeight: '800', 
                fontSize: '14px',
                cursor: 'pointer', 
                color: '#000',
                boxShadow: '0 4px 14px rgba(255,115,0,0.3)',
                transition: 'transform 0.1s'
              }} onMouseDown={e => e.currentTarget.style.transform = 'translateY(1px)'} onMouseUp={e => e.currentTarget.style.transform = 'translateY(-0.5px)'}>
                ACTIVATE AUTOMATION
              </button>
           </div>
        </div>
      </div>

      {/* Workforce Table */}
      <div className="premium-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ fontSize: '18px', fontWeight: '700' }}>Workforce Intelligence</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ padding: '6px 12px', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>Export PDF</div>
            <MoreVertical size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <th style={{ paddingBottom: '16px' }}>Employee Identity</th>
              <th style={{ paddingBottom: '16px' }}>Monitoring Level</th>
              <th style={{ paddingBottom: '16px' }}>Distraction</th>
              <th style={{ paddingBottom: '16px' }}>Estimated ROI</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, i) => (
              <tr key={emp.name} style={{ borderBottom: i === employees.length - 1 ? 'none' : '1px solid var(--border-subtle)', fontSize: '14px' }}>
                <td style={{ padding: '20px 0', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-sidebar)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{emp.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{emp.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{emp.email}</div>
                  </div>
                </td>
                <td>
                  <span style={{ 
                    padding: '5px 12px', 
                    borderRadius: '20px', 
                    fontSize: '11px',
                    fontWeight: '700',
                    background: emp.phase === 2 ? 'rgba(255, 115, 0, 0.1)' : 'var(--bg-base)',
                    color: emp.phase === 2 ? 'var(--accent-primary)' : 'var(--text-muted)',
                    border: emp.phase === 2 ? '1px solid rgba(255, 115, 0, 0.3)' : '1px solid var(--border-subtle)'
                  }}>
                    {emp.phase === 2 ? 'HIGH FIDELITY' : 'METADATA ONLY'}
                  </span>
                </td>
                <td className="metric-font" style={{ fontWeight: '700', color: emp.distraction > 25 ? '#ff4444' : 'var(--text-primary)' }}>
                  {emp.distraction}%
                </td>
                <td className="metric-font" style={{ fontWeight: '700', color: emp.roi ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                  {emp.roi ? `₹${emp.roi.toLocaleString()}` : '--'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Overview
