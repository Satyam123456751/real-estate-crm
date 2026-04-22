import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [dealStats, setDealStats] = useState({});

  useEffect(() => {
    API.get('/leads').then(r => setLeads(r.data)).catch(() => {});
    API.get('/properties').then(r => setProperties(r.data)).catch(() => {});
    API.get('/deals/stats/summary').then(r => setDealStats(r.data)).catch(() => {});
  }, []);

  const leadCounts = ['new', 'contacted', 'qualified', 'closed', 'lost'].map(s =>
    leads.filter(l => l.status === s).length
  );
  const propertyCounts = ['available', 'sold', 'rented'].map(s =>
    properties.filter(p => p.status === s).length
  );

  const cards = [
    { icon: '📋', label: 'Total Leads', value: leads.length, color: '#6366f1', sub: `${leads.filter(l=>l.status==='new').length} new` },
    { icon: '🏢', label: 'Properties', value: properties.length, color: '#10b981', sub: `${properties.filter(p=>p.status==='available').length} available` },
    { icon: '🤝', label: 'Deals Closed', value: dealStats.closed_deals || 0, color: '#f59e0b', sub: `${dealStats.total_deals || 0} total` },
    { icon: '💰', label: 'Revenue', value: `₹${Number(dealStats.total_revenue || 0).toLocaleString()}`, color: '#ec4899', sub: `₹${Number(dealStats.total_commission || 0).toLocaleString()} commission` },
  ];

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <p style={s.greet}>Good day! 👋</p>
          <h1 style={s.title}>Dashboard Overview</h1>
        </div>
        <div style={s.date}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>

      <div style={s.grid4}>
        {cards.map(c => (
          <div key={c.label} style={{ ...s.statCard, borderColor: c.color + '33' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ ...s.statIcon, background: c.color + '22', color: c.color }}>{c.icon}</div>
              <div style={{ ...s.pill, background: c.color + '22', color: c.color }}>{c.sub}</div>
            </div>
            <div style={{ ...s.statVal, color: c.color }}>{c.value}</div>
            <div style={s.statLbl}>{c.label}</div>
            <div style={{ ...s.bar, background: c.color + '22' }}>
              <div style={{ height: '100%', width: `${Math.min((c.value || 1) * 10, 100)}%`, background: c.color, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={s.grid3}>
        <div style={{ ...s.chartBox, gridColumn: 'span 2' }}>
          <div style={s.chartTop}>
            <span style={s.chartTitle}>Lead Pipeline</span>
            <span style={s.chartSub}>{leads.length} total leads</span>
          </div>
          <Bar data={{
            labels: ['New', 'Contacted', 'Qualified', 'Closed', 'Lost'],
            datasets: [{
              data: leadCounts,
              backgroundColor: ['#6366f1bb', '#f59e0bbb', '#10b981bb', '#06b6d4bb', '#ef4444bb'],
              borderRadius: 8, borderSkipped: false,
            }]
          }} options={{
            responsive: true,
            plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: '#334155', borderWidth: 1 } },
            scales: {
              y: { grid: { color: '#1e293b' }, ticks: { color: '#64748b', font: { size: 11 } }, border: { display: false } },
              x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11 } }, border: { display: false } }
            }
          }} />
        </div>

        <div style={s.chartBox}>
          <div style={s.chartTop}>
            <span style={s.chartTitle}>Properties</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ width: 160 }}>
              <Doughnut data={{
                labels: ['Available', 'Sold', 'Rented'],
                datasets: [{ data: propertyCounts.map(v => v || 0), backgroundColor: ['#10b981', '#ef4444', '#6366f1'], borderWidth: 0, hoverOffset: 6 }]
              }} options={{ cutout: '72%', plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: '#334155', borderWidth: 1 } } }} />
            </div>
          </div>
          {[['Available', '#10b981', propertyCounts[0]], ['Sold', '#ef4444', propertyCounts[1]], ['Rented', '#6366f1', propertyCounts[2]]].map(([label, color, count]) => (
            <div key={label} style={s.legendRow}>
              <div style={{ ...s.dot, background: color }} />
              <span style={s.legendLbl}>{label}</span>
              <span style={{ ...s.legendVal, color }}>{count || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { padding: 28, minHeight: '100vh', background: '#0f172a' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 },
  greet: { fontSize: 14, color: '#64748b', marginBottom: 4 },
  title: { fontSize: 26, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' },
  date: { fontSize: 13, color: '#64748b', background: '#1e293b', border: '1px solid #334155', padding: '8px 16px', borderRadius: 10 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: 16 },
  statCard: { background: '#1e293b', border: '1px solid', borderRadius: 16, padding: 22 },
  statIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  pill: { fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20 },
  statVal: { fontSize: 30, fontWeight: 800, marginTop: 16, marginBottom: 4 },
  statLbl: { fontSize: 13, color: '#64748b' },
  bar: { height: 6, borderRadius: 4, marginTop: 16, overflow: 'hidden' },
  chartBox: { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 24 },
  chartTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  chartTitle: { fontSize: 15, fontWeight: 700, color: '#f1f5f9' },
  chartSub: { fontSize: 12, color: '#64748b' },
  legendRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid #334155' },
  dot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  legendLbl: { fontSize: 13, color: '#94a3b8', flex: 1 },
  legendVal: { fontWeight: 700, fontSize: 15 },
};