import React, { useEffect, useState } from 'react';
import API from '../api/axios';

const TYPE_COLOR = { buyer: '#6366f1', seller: '#f59e0b', both: '#10b981' };
const INT_ICON = { call: '📞', sms: '💬', email: '📧', visit: '🏠' };

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showIntForm, setShowIntForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ lead_id: '', name: '', email: '', phone: '', client_type: 'buyer', preferences: '' });
  const [intForm, setIntForm] = useState({ type: 'call', notes: '' });

  useEffect(() => {
    API.get('/clients').then(r => setClients(r.data)).catch(() => {});
    API.get('/leads').then(r => setLeads(r.data)).catch(() => {});
  }, []);

  const openClient = async (c) => {
    setSelected(c);
    try { const r = await API.get(`/clients/${c.id}/interactions`); setInteractions(r.data); } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/clients', form);
      setShowForm(false);
      setForm({ lead_id: '', name: '', email: '', phone: '', client_type: 'buyer', preferences: '' });
      const r = await API.get('/clients'); setClients(r.data);
    } catch (err) { alert('Error: ' + (err.response?.data?.error || err.message)); }
    finally { setLoading(false); }
  };

  const logInteraction = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/clients/${selected.id}/interactions`, intForm);
      setShowIntForm(false);
      setIntForm({ type: 'call', notes: '' });
      const r = await API.get(`/clients/${selected.id}/interactions`); setInteractions(r.data);
    } catch {}
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Clients</h1>
          <p style={s.sub}>{clients.length} clients registered</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={s.addBtn}>
          {showForm ? '✕ Cancel' : '+ Add Client'}
        </button>
      </div>

      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>New Client</h3>
          <form onSubmit={handleSubmit}>
            <div style={s.formGrid}>
              <div style={s.field}>
                <label style={s.lbl}>Name *</label>
                <input style={s.inp} placeholder="Client name" required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div style={s.field}>
                <label style={s.lbl}>Phone</label>
                <input style={s.inp} placeholder="+91 99999 00000" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div style={s.field}>
                <label style={s.lbl}>Email</label>
                <input style={s.inp} placeholder="client@email.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div style={s.field}>
                <label style={s.lbl}>Type</label>
                <select style={s.inp} value={form.client_type} onChange={e => setForm({ ...form, client_type: e.target.value })}>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div style={s.field}>
                <label style={s.lbl}>Link to Lead</label>
                <select style={s.inp} value={form.lead_id} onChange={e => setForm({ ...form, lead_id: e.target.value })}>
                  <option value="">None</option>
                  {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.lbl}>Preferences</label>
                <input style={s.inp} placeholder="3BHK, South facing..." value={form.preferences}
                  onChange={e => setForm({ ...form, preferences: e.target.value })} />
              </div>
            </div>
            <button type="submit" style={{ ...s.addBtn, marginTop: 16 }} disabled={loading}>
              {loading ? 'Saving...' : 'Save Client'}
            </button>
          </form>
        </div>
      )}

      <div style={s.layout}>
        <div style={s.list}>
          {clients.length === 0 && <div style={s.emptyList}>No clients yet</div>}
          {clients.map(c => (
            <div key={c.id} onClick={() => openClient(c)}
              style={{ ...s.clientRow, ...(selected?.id === c.id ? s.activeRow : {}) }}>
              <div style={{ ...s.avatar, background: TYPE_COLOR[c.client_type] + '33', color: TYPE_COLOR[c.client_type] }}>
                {c.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.cName}>{c.name}</div>
                <div style={s.cMeta}>{c.phone || c.email || '—'}</div>
              </div>
              <span style={{ ...s.typePill, background: TYPE_COLOR[c.client_type] + '22', color: TYPE_COLOR[c.client_type] }}>
                {c.client_type}
              </span>
            </div>
          ))}
        </div>

        <div style={s.detail}>
          {!selected ? (
            <div style={s.selectPrompt}>
              <div style={{ fontSize: 48 }}>👥</div>
              <div style={{ marginTop: 12, color: '#475569' }}>Select a client to view details</div>
            </div>
          ) : (
            <>
              <div style={s.detailTop}>
                <div style={{ ...s.bigAvatar, background: TYPE_COLOR[selected.client_type] + '33', color: TYPE_COLOR[selected.client_type] }}>
                  {selected.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 style={s.detailName}>{selected.name}</h2>
                  <div style={s.detailContact}>{selected.email} {selected.phone && `• ${selected.phone}`}</div>
                  <span style={{ ...s.typePill, background: TYPE_COLOR[selected.client_type] + '22', color: TYPE_COLOR[selected.client_type], marginTop: 8, display: 'inline-block' }}>
                    {selected.client_type}
                  </span>
                </div>
              </div>

              {selected.preferences && (
                <div style={s.prefBox}>💡 <strong>Preferences:</strong> {selected.preferences}</div>
              )}

              <div style={s.intHeader}>
                <span style={s.intTitle}>Interaction History</span>
                <button onClick={() => setShowIntForm(!showIntForm)} style={s.logBtn}>
                  {showIntForm ? '✕' : '+ Log'}
                </button>
              </div>

              {showIntForm && (
                <form onSubmit={logInteraction} style={s.intForm}>
                  <select style={s.inp} value={intForm.type} onChange={e => setIntForm({ ...intForm, type: e.target.value })}>
                    <option value="call">📞 Call</option>
                    <option value="sms">💬 SMS</option>
                    <option value="email">📧 Email</option>
                    <option value="visit">🏠 Visit</option>
                  </select>
                  <input style={{ ...s.inp, flex: 1 }} placeholder="Add notes..." value={intForm.notes}
                    onChange={e => setIntForm({ ...intForm, notes: e.target.value })} />
                  <button type="submit" style={s.addBtn}>Log</button>
                </form>
              )}

              <div style={s.timeline}>
                {interactions.length === 0
                  ? <div style={{ color: '#475569', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>No interactions yet</div>
                  : interactions.map(i => (
                    <div key={i.id} style={s.intItem}>
                      <div style={s.intIcon}>{INT_ICON[i.type]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={s.intNote}>{i.notes || 'No notes'}</div>
                        <div style={s.intMeta}>{i.agent_name || 'Agent'} • {new Date(i.interacted_at).toLocaleString()}</div>
                      </div>
                      <span style={s.intType}>{i.type}</span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
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
  formCard: { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 24, marginBottom: 20 },
  formTitle: { fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  lbl: { fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  inp: { padding: '11px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none' },
  layout: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 },
  list: { display: 'flex', flexDirection: 'column', gap: 6 },
  emptyList: { color: '#475569', fontSize: 14, textAlign: 'center', padding: '40px 0' },
  clientRow: { display: 'flex', alignItems: 'center', gap: 12, background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '12px 14px', cursor: 'pointer' },
  activeRow: { borderColor: '#6366f1', background: '#1e1b4b' },
  avatar: { width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0 },
  cName: { fontWeight: 600, color: '#f1f5f9', fontSize: 14 },
  cMeta: { fontSize: 12, color: '#64748b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  typePill: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize', flexShrink: 0 },
  detail: { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 24, minHeight: 400 },
  selectPrompt: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300 },
  detailTop: { display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #334155' },
  bigAvatar: { width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22, flexShrink: 0 },
  detailName: { fontSize: 20, fontWeight: 800, color: '#f1f5f9' },
  detailContact: { fontSize: 13, color: '#64748b', marginTop: 4 },
  prefBox: { background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#94a3b8', marginBottom: 20 },
  intHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  intTitle: { fontSize: 15, fontWeight: 700, color: '#f1f5f9' },
  logBtn: { padding: '6px 14px', background: '#334155', color: '#94a3b8', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  intForm: { display: 'flex', gap: 10, marginBottom: 16 },
  timeline: { display: 'flex', flexDirection: 'column', gap: 10 },
  intItem: { display: 'flex', alignItems: 'flex-start', gap: 12, background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: '12px 16px' },
  intIcon: { fontSize: 20, flexShrink: 0 },
  intNote: { fontSize: 14, color: '#e2e8f0', fontWeight: 500 },
  intMeta: { fontSize: 12, color: '#64748b', marginTop: 3 },
  intType: { background: '#334155', color: '#94a3b8', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' },
};