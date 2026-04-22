import React, { useEffect, useState } from 'react';
import API from '../api/axios';

const STAGES = ['negotiation', 'agreement', 'closed'];
const STAGE_CONFIG = {
  negotiation: { color: '#f59e0b', bg: '#78350f22', icon: '🔄', label: 'Negotiation' },
  agreement: { color: '#6366f1', bg: '#1e1b4b22', icon: '📝', label: 'Agreement' },
  closed: { color: '#10b981', bg: '#05261422', icon: '✅', label: 'Closed' },
};

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [clients, setClients] = useState([]);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ client_id: '', property_id: '', deal_value: '' });

  const fetchAll = async () => {
    try {
      const [d, c, p, st] = await Promise.all([
        API.get('/deals'), API.get('/clients'),
        API.get('/properties'), API.get('/deals/stats/summary'),
      ]);
      setDeals(d.data); setClients(c.data);
      setProperties(p.data); setStats(st.data);
    } catch {}
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/deals', form);
      setShowForm(false);
      setForm({ client_id: '', property_id: '', deal_value: '' });
      fetchAll();
    } catch (err) { alert('Error: ' + (err.response?.data?.error || err.message)); }
    finally { setLoading(false); }
  };

  const moveStage = async (id, stage) => {
    try { await API.put(`/deals/${id}/stage`, { stage }); fetchAll(); } catch {}
  };

  const deleteDeal = async (id) => {
    if (!window.confirm('Delete this deal?')) return;
    try { await API.delete(`/deals/${id}`); fetchAll(); } catch {}
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Deal Pipeline</h1>
          <p style={s.sub}>Track every deal from negotiation to close</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={s.addBtn}>
          {showForm ? '✕ Cancel' : '+ New Deal'}
        </button>
      </div>

      <div style={s.statsRow}>
        {[
          { label: 'Total Deals', value: stats.total_deals || 0, color: '#6366f1', icon: '📊' },
          { label: 'Closed', value: stats.closed_deals || 0, color: '#10b981', icon: '✅' },
          { label: 'Revenue', value: `₹${Number(stats.total_revenue || 0).toLocaleString()}`, color: '#f59e0b', icon: '💰' },
          { label: 'Commission', value: `₹${Number(stats.total_commission || 0).toLocaleString()}`, color: '#ec4899', icon: '🏆' },
        ].map(item => (
          <div key={item.label} style={{ ...s.statCard, borderColor: item.color + '33' }}>
            <span style={{ fontSize: 24 }}>{item.icon}</span>
            <div style={{ ...s.statVal, color: item.color }}>{item.value}</div>
            <div style={s.statLbl}>{item.label}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>Create New Deal</h3>
          <form onSubmit={handleSubmit}>
            <div style={s.formGrid}>
              <div style={s.field}>
                <label style={s.lbl}>Client *</label>
                <select required style={s.inp} value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })}>
                  <option value="">Select client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.lbl}>Property *</label>
                <select required style={s.inp} value={form.property_id} onChange={e => setForm({ ...form, property_id: e.target.value })}>
                  <option value="">Select property...</option>
                  {properties.filter(p => p.status === 'available').map(p => (
                    <option key={p.id} value={p.id}>{p.title} — ₹{Number(p.price || 0).toLocaleString()}</option>
                  ))}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.lbl}>Deal Value (₹) *</label>
                <input required type="number" style={s.inp} placeholder="e.g. 8500000"
                  value={form.deal_value} onChange={e => setForm({ ...form, deal_value: e.target.value })} />
              </div>
            </div>
            <button type="submit" style={{ ...s.addBtn, marginTop: 16 }} disabled={loading}>
              {loading ? 'Creating...' : 'Create Deal'}
            </button>
          </form>
        </div>
      )}

      <div style={s.kanban}>
        {STAGES.map(stage => {
          const cfg = STAGE_CONFIG[stage];
          const stageDeals = deals.filter(d => d.stage === stage);
          return (
            <div key={stage} style={{ ...s.column, borderTop: `3px solid ${cfg.color}` }}>
              <div style={s.colHeader}>
                <div style={s.colTitle}>
                  <span>{cfg.icon}</span>
                  <span style={{ color: cfg.color }}>{cfg.label}</span>
                </div>
                <div style={{ ...s.colCount, background: cfg.color + '22', color: cfg.color }}>{stageDeals.length}</div>
              </div>

              <div style={s.colBody}>
                {stageDeals.length === 0 && (
                  <div style={s.emptyCol}>No deals here</div>
                )}
                {stageDeals.map(deal => (
                  <div key={deal.id} style={s.dealCard}>
                    <div style={s.dealProp}>{deal.property_title || 'Property'}</div>
                    <div style={s.dealClient}>👤 {deal.client_name || '—'}</div>
                    <div style={{ ...s.dealValue, color: cfg.color }}>
                      ₹{Number(deal.deal_value || 0).toLocaleString()}
                    </div>
                    <div style={s.dealComm}>Commission: ₹{Number(deal.commission_amount || 0).toLocaleString()}</div>
                    <div style={s.dealBtns}>
                      {stage !== 'negotiation' && (
                        <button onClick={() => moveStage(deal.id, STAGES[STAGES.indexOf(stage) - 1])}
                          style={s.backBtn}>← Back</button>
                      )}
                      {stage !== 'closed' && (
                        <button onClick={() => moveStage(deal.id, STAGES[STAGES.indexOf(stage) + 1])}
                          style={{ ...s.nextBtn, background: STAGE_CONFIG[STAGES[STAGES.indexOf(stage) + 1]].color }}>
                          Next →
                        </button>
                      )}
                      {stage === 'closed' && (
                        <span style={s.closedTag}>🎉 Won!</span>
                      )}
                      <button onClick={() => deleteDeal(deal.id)} style={s.delBtn}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  page: { padding: 28, minHeight: '100vh', background: '#0f172a' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' },
  sub: { fontSize: 14, color: '#64748b', marginTop: 4 },
  addBtn: { padding: '11px 22px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#1e293b', border: '1px solid', borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 },
  statVal: { fontSize: 24, fontWeight: 800 },
  statLbl: { fontSize: 13, color: '#64748b' },
  formCard: { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 24, marginBottom: 24 },
  formTitle: { fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  lbl: { fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  inp: { padding: '11px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none' },
  kanban: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 },
  column: { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, overflow: 'hidden' },
  colHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', borderBottom: '1px solid #334155' },
  colTitle: { display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15 },
  colCount: { padding: '3px 10px', borderRadius: 20, fontSize: 13, fontWeight: 700 },
  colBody: { padding: 12, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 200 },
  emptyCol: { textAlign: 'center', color: '#334155', fontSize: 14, padding: '40px 0', border: '2px dashed #334155', borderRadius: 10 },
  dealCard: { background: '#0f172a', border: '1px solid #334155', borderRadius: 12, padding: 16 },
  dealProp: { fontWeight: 700, color: '#f1f5f9', fontSize: 14, marginBottom: 6 },
  dealClient: { fontSize: 13, color: '#64748b', marginBottom: 10 },
  dealValue: { fontSize: 20, fontWeight: 800, marginBottom: 4 },
  dealComm: { fontSize: 12, color: '#475569', marginBottom: 14 },
  dealBtns: { display: 'flex', gap: 6, alignItems: 'center' },
  backBtn: { padding: '6px 12px', background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  nextBtn: { padding: '6px 12px', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  closedTag: { fontSize: 12, color: '#10b981', fontWeight: 700 },
  delBtn: { padding: '6px 9px', background: '#450a0a', color: '#ef4444', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, marginLeft: 'auto' },
};