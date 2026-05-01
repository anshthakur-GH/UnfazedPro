import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { TrendingUp, TrendingDown, MoreVertical, RefreshCw, Moon, Bell, Globe, ChevronDown } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts'

const MetricCard = ({ label, value, delta, deltaUp, gauge }) => (
  <div style={{
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '20px',
    flex: 1
  }}>
    <div className="metric-label">{label}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
      <div className="metric-value">{value}</div>
      {gauge && (
        <div style={{ width: '40px', height: '40px', position: 'relative' }}>
          <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#222" strokeWidth="3" />
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--accent-green)" strokeWidth="3" strokeDasharray={`${gauge}, 100`} />
          </svg>
        </div>
      )}
    </div>
    <div className="delta-badge" style={{ color: deltaUp ? 'var(--positive-delta)' : 'var(--negative-delta)', background: 'rgba(0,0,0,0.2)', marginTop: '8px' }}>
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
    }
    fetchData()
  }, [])

  if (!data) return <div style={{ padding: '40px' }}>Loading Terminal...</div>

  return (
    <div style={{ padding: '24px' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Dashboards / <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Overview</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: 'var(--text-secondary)' }}>
          <Moon size={18} /> <RefreshCw size={18} /> <Bell size={18} /> <Globe size={18} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 className="section-title">Overview</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
          Today <ChevronDown size={14} />
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <MetricCard label="Active Employees" value={data.active_employees} delta="↑ 3 since last month" deltaUp />
        <MetricCard label="Avg Daily Hours" value={`${data.avg_active_hours}h`} delta="↑ 8% vs last month" deltaUp />
        <MetricCard label="Distraction Rate" value={`${data.avg_distraction_pct}%`} gauge={data.avg_distraction_pct} delta="↓ 2.4% vs last month" deltaUp />
        <MetricCard label="Automation Proposals" value={data.proposals_generated} delta="↑ 2 this quarter" deltaUp />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Sales Overview Card */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div className="card-title">Activity Overview</div>
            <MoreVertical size={16} color="var(--text-muted)" />
          </div>
          <div style={{ display: 'flex', gap: '40px' }}>
            <div style={{ width: '200px', height: '200px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={appData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {appData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--accent-green)' : `rgba(168, 255, 62, ${0.8 - index * 0.2})`} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700' }}>142k</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Events</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
               <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                  <div className="metric-label">Total Keystrokes</div>
                  <div className="metric-value" style={{ fontSize: '20px', marginTop: '4px' }}>1.24M</div>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {appData.map((app, i) => (
                    <div key={app.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>● {app.name}</span>
                      <span>{app.value}h</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* Small Trends Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
           <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '20px', flex: 1 }}>
              <div className="metric-label">Distraction Trend</div>
              <div style={{ height: '100px', marginTop: '10px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-green)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--accent-green)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="var(--accent-green)" fillOpacity={1} fill="url(#colorDist)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>
           <div style={{ 
             background: 'linear-gradient(135deg, var(--bg-secondary) 0%, #1e3a1a 100%)', 
             borderRadius: '12px', 
             border: '1px solid var(--accent-green-dim)', 
             padding: '24px',
             position: 'relative',
             overflow: 'hidden'
           }}>
              <div style={{ position: 'absolute', top: '10px', right: '10px', width: '32px', height: '32px', background: 'var(--accent-green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</div>
              <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Agent 2 Ready</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Run Automation Analysis for Aryan Mehta</div>
              <button style={{ width: '100%', background: 'var(--accent-green)', border: 'none', borderRadius: '24px', padding: '12px', fontWeight: '700', cursor: 'pointer', color: '#111' }}>Run Agent 2 Now</button>
           </div>
        </div>
      </div>

      {/* Employee Table */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div className="section-title">Employee List</div>
          <MoreVertical size={16} color="var(--text-muted)" />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '11px' }}>
              <th style={{ paddingBottom: '12px' }}>Name</th>
              <th style={{ paddingBottom: '12px' }}>Phase</th>
              <th style={{ paddingBottom: '12px' }}>Distraction Rate</th>
              <th style={{ paddingBottom: '12px' }}>ROI Potential</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, i) => (
              <tr key={emp.name} style={{ borderBottom: i === employees.length - 1 ? 'none' : '1px solid var(--border-color)', fontSize: '13px' }}>
                <td style={{ padding: '16px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#333', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{emp.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: '600' }}>{emp.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{emp.email}</div>
                  </div>
                </td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '20px', 
                    fontSize: '11px',
                    background: emp.phase === 2 ? 'rgba(168, 255, 62, 0.15)' : 'var(--bg-tertiary)',
                    color: emp.phase === 2 ? 'var(--accent-green)' : 'var(--text-secondary)',
                    border: emp.phase === 2 ? '1px solid var(--accent-green-dim)' : 'none'
                  }}>
                    Phase {emp.phase} {emp.phase === 2 ? '(Visual)' : '(Metadata)'}
                  </span>
                </td>
                <td style={{ color: emp.distraction > 25 ? 'var(--negative-delta)' : emp.distraction > 15 ? 'var(--accent-amber)' : 'var(--accent-green)' }}>
                  {emp.distraction}%
                </td>
                <td style={{ fontWeight: '500' }}>{emp.roi ? `₹${emp.roi.toLocaleString()}/mo` : 'Pending'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Overview
