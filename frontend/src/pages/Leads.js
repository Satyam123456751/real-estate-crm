import React, { useEffect, useState } from 'react';
import API from '../api/axios';

const STATUS = ['new', 'contacted', 'qualified', 'closed', 'lost'];
const COLORS = { new: '#6366f1', contacted: '#f59e0b', qualified: '#10b981', closed: '#06b6d4', lost: '#ef4444' };
const SOURCES = ['website', 'ads', 'call', 'referral'];

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', source: 'website', budget: '', preferences: '' });

  const fetchLeads = async () => {
    try { const r = await API.get('/leads'); setLeads(r.data); } catch {}
  };
  useEffect(() => { fetchLeads(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await API.post('/leads', form);
      setShowForm(false);
      setForm({ name: '', phone: '', email: '', source: 'website', budget: '', preferences: '' });
      fetchLeads();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;
    try { await API.put(`/leads/${id}`, { ...lead, status }); fetchLeads(); } catch {}
  };

  const deleteLead = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try { await API.delete(`/leads/${id}`); fetchLeads(); } catch {}
  };

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Leads</h1>
          <p style={s.sub}>{leads.length} total leads in pipeline</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={s.addBtn}>
          {showForm ? '✕ Cancel' : '+ Add Lead'}
        </button>
      </div>

      <div style={s.chips}>
        <div onClick={() => setFilter('all')} style={{ ...s.chip, ...(filter === 'all' ? s.chipActive : {}) }}>
          All <span style={s.count}>{leads.length}</span>
        </div>
        {STATUS.map(st => (
          <div key={st} onClick={() => setFilter(st)}
            style={{ ...s.chip, ...(filter === st ? { ...s.chipActive, borderColor: COLORS[st], color: COLORS[st] } : {}) }}>
            {st.charAt(0).toUpperCase() + st.slice(1)}
            <span style={{ ...s.count, background: COLORS[st] + '22', color: COLORS[st] }}>
              {leads.filter(l => l.status === st).length}
            </span>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>New Lead</h3>
          <form onSubmit={handleSubmit}>
            <div style={s.formGrid}>
              <div style={s.field}>
                <label style={s.lbl}>Name *</label>
                <input style={s.inp} placeholder="John Doe" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div style={s.field}>
                <label style={s.lbl}>Phone</label>
                <input style={s.inp} placeholder="+91 99999 00000" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div style={s.field}>
                <label style={s.lbl}>Email</label>
                <input style={s.inp} placeholder="john@email.com" type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div style={s.field}>
                <label style={s.lbl}>Source</label>
                <select style={s.inp} value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
                  {SOURCES.map(src => <option key={src} value={src}>{src.charAt(0).toUpperCase() + src.slice(1)}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.lbl}>Budget (₹)</label>
                <input style={s.inp} placeholder="5000000" type="number" value={form.budget}
                  onChange={e => setForm({ ...form, budget: e.target.value })} />
              </div>
              <div style={s.field}>
                <label style={s.lbl}>Preferences</label>
                <input style={s.inp} placeholder="3BHK, East facing..." value={form.preferences}
                  onChange={e => setForm({ ...form, preferences: e.target.value })} />
              </div>
            </div>
            <button type="submit" style={{ ...s.addBtn, marginTop: 16 }} disabled={loading}>
              {loading ? 'Saving...' : 'Save Lead'}
            </button>
          </form>
        </div>
      )}

      <div style={s.tableWrap}>
        {filtered.length === 0
          ? <div style={s.empty}>No leads found. Add your first lead! 🎯</div>
          : (
            <table style={s.table}>
              <thead>
                <tr>
                  {['Name', 'Contact', 'Source', 'Budget', 'Status', 'Follow Up', ''].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => (
                  <tr key={lead.id} style={s.row}>
                    <td style={s.td}>
                      <div style={s.nameCell}>
                        <div style={{ ...s.dot, background: COLORS[lead.status] }} />
                        <div>
                          <div style={s.name}>{lead.name}</div>
                          {lead.preferences && <div style={s.pref}>{lead.preferences}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={s.td}>
                      <div style={s.contact}>{lead.phone || '—'}</div>
                      <div style={s.contactSub}>{lead.email || ''}</div>
                    </td>
                    <td style={s.td}>
                      <span style={s.sourcePill}>{lead.source}</span>
                    </td>
                    <td style={s.td}>
                      <span style={s.budget}>{lead.budget ? `₹${Number(lead.budget).toLocaleString()}` : '—'}</span>
                    </td>
                    <td style={s.td}>
                      <select value={lead.status} onChange={e => updateStatus(lead.id, e.target.value)}
                        style={{ ...s.statusSel, borderColor: COLORS[lead.status] + '66', color: COLORS[lead.status], background: COLORS[lead.status] + '11' }}>
                        {STATUS.map(st => <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>)}
                      </select>
                    </td>
                    <td style={s.td}>
                      <span style={s.dateText}>{lead.follow_up_date ? new Date(lead.follow_up_date).toLocaleDateString() : '—'}</span>
                    </td>
                    <td style={s.td}>
                      <button onClick={() => deleteLead(lead.id)} style={s.delBtn}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
  chips: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  chip: { padding: '7px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: 20, color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
  chipActive: { background: '#1e293b', borderColor: '#6366f1', color: '#f1f5f9' },
  count: { background: '#334155', color: '#94a3b8', borderRadius: 10, padding: '1px 8px', fontSize: 11 },
  formCard: { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 24, marginBottom: 20 },
  formTitle: { fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  lbl: { fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  inp: { padding: '11px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none' },
  tableWrap: { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#162032', borderBottom: '1px solid #334155' },
  row: { borderBottom: '1px solid #1e293b99' },
  td: { padding: '14px 20px', fontSize: 14 },
  nameCell: { display: 'flex', alignItems: 'center', gap: 12 },
  dot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  name: { fontWeight: 600, color: '#f1f5f9', marginBottom: 2 },
  pref: { fontSize: 12, color: '#64748b' },
  contact: { color: '#e2e8f0', fontSize: 13 },
  contactSub: { color: '#64748b', fontSize: 12, marginTop: 2 },
  sourcePill: { background: '#334155', color: '#94a3b8', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 },
  budget: { color: '#10b981', fontWeight: 600 },
  statusSel: { padding: '5px 10px', border: '1px solid', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none' },
  dateText: { color: '#64748b', fontSize: 13 },
  delBtn: { background: '#450a0a', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 14 },
  empty: { padding: 60, textAlign: 'center', color: '#475569', fontSize: 15 },
};