import React, { useEffect, useState } from 'react';
import API from '../api/axios';

const STATUS_COLOR = { available: '#10b981', sold: '#ef4444', rented: '#6366f1' };
const STATUS_BG = { available: '#052e16', sold: '#450a0a', rented: '#1e1b4b' };

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ title: '', type: 'residential', price: '', size_sqft: '', location: '', status: 'available' });

  const fetchProperties = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterStatus) params.append('status', filterStatus);
      const r = await API.get(`/properties?${params}`);
      setProperties(r.data);
    } catch {}
  };

  useEffect(() => { fetchProperties(); }, [filterType, filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/properties', { ...form, amenities: [], images: [] });
      setShowForm(false);
      setForm({ title: '', type: 'residential', price: '', size_sqft: '', location: '', status: 'available' });
      fetchProperties();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally { setLoading(false); }
  };

  const deleteProperty = async (id) => {
    if (!window.confirm('Delete this property?')) return;
    try { await API.delete(`/properties/${id}`); fetchProperties(); } catch {}
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Properties</h1>
          <p style={s.sub}>{properties.length} listings</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={s.addBtn}>
          {showForm ? '✕ Cancel' : '+ Add Property'}
        </button>
      </div>

      <div style={s.filterRow}>
        <select style={s.filterSel} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
        </select>
        <select style={s.filterSel} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="rented">Rented</option>
        </select>
        {(filterType || filterStatus) && (
          <button onClick={() => { setFilterType(''); setFilterStatus(''); }} style={s.clearBtn}>✕ Clear</button>
        )}
        <div style={s.statPills}>
          {['available', 'sold', 'rented'].map(st => (
            <div key={st} style={{ ...s.statPill, background: STATUS_BG[st], color: STATUS_COLOR[st], border: `1px solid ${STATUS_COLOR[st]}33` }}>
              {properties.filter(p => p.status === st).length} {st}
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>New Property Listing</h3>
          <form onSubmit={handleSubmit}>
            <div style={s.formGrid}>
              <div style={{ ...s.field, gridColumn: 'span 2' }}>
                <label style={s.lbl}>Title *</label>
                <input style={s.inp} placeholder="3BHK Apartment in Bandra..." value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div style={s.field}>
                <label style={s.lbl}>Location</label>
                <input style={s.inp} placeholder="Mumbai, Maharashtra" value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              <div style={s.field}>
                <label style={s.lbl}>Price (₹)</label>
                <input style={s.inp} placeholder="8500000" type="number" value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
              <div style={s.field}>
                <label style={s.lbl}>Size (sqft)</label>
                <input style={s.inp} placeholder="1200" type="number" value={form.size_sqft}
                  onChange={e => setForm({ ...form, size_sqft: e.target.value })} />
              </div>
              <div style={s.field}>
                <label style={s.lbl}>Type</label>
                <select style={s.inp} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div style={s.field}>
                <label style={s.lbl}>Status</label>
                <select style={s.inp} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </div>
            </div>
            <button type="submit" style={{ ...s.addBtn, marginTop: 16 }} disabled={loading}>
              {loading ? 'Saving...' : 'Save Property'}
            </button>
          </form>
        </div>
      )}

      {properties.length === 0
        ? <div style={s.empty}>No properties found. Add your first listing! 🏢</div>
        : (
          <div style={s.grid}>
            {properties.map(p => (
              <div key={p.id} style={s.card}>
                <div style={s.cardImg}>
                  <span style={{ fontSize: 36 }}>{p.type === 'commercial' ? '🏢' : '🏠'}</span>
                  <div style={{ ...s.statusTag, background: STATUS_BG[p.status], color: STATUS_COLOR[p.status], border: `1px solid ${STATUS_COLOR[p.status]}44` }}>
                    {p.status}
                  </div>
                </div>
                <div style={s.cardBody}>
                  <div style={s.cardTitle}>{p.title}</div>
                  <div style={s.cardLoc}>📍 {p.location || 'Location not set'}</div>
                  <div style={s.priceRow}>
                    <span style={s.price}>₹{Number(p.price || 0).toLocaleString()}</span>
                    <span style={s.size}>{p.size_sqft ? `${p.size_sqft} sqft` : ''}</span>
                  </div>
                  <div style={s.typePill}>{p.type}</div>
                  <button onClick={() => deleteProperty(p.id)} style={s.delBtn}>🗑 Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

const s = {
  page: { padding: 28, minHeight: '100vh', background: '#0f172a' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' },
  sub: { fontSize: 14, color: '#64748b', marginTop: 4 },
  addBtn: { padding: '11px 22px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  filterRow: { display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' },
  filterSel: { padding: '10px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: 10, color: '#94a3b8', fontSize: 13, outline: 'none' },
  clearBtn: { padding: '10px 14px', background: 'transparent', border: '1px solid #ef4444aa', borderRadius: 10, color: '#ef4444', fontSize: 13, cursor: 'pointer' },
  statPills: { display: 'flex', gap: 8, marginLeft: 'auto' },
  statPill: { padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  formCard: { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 24, marginBottom: 20 },
  formTitle: { fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  lbl: { fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  inp: { padding: '11px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, overflow: 'hidden' },
  cardImg: { background: '#0f172a', height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  statusTag: { position: 'absolute', top: 12, right: 12, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px' },
  cardBody: { padding: 18 },
  cardTitle: { fontWeight: 700, color: '#f1f5f9', fontSize: 15, marginBottom: 6 },
  cardLoc: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  price: { fontSize: 20, fontWeight: 800, color: '#10b981' },
  size: { fontSize: 13, color: '#475569' },
  typePill: { display: 'inline-block', background: '#334155', color: '#94a3b8', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, marginBottom: 14, textTransform: 'capitalize' },
  delBtn: { width: '100%', padding: '9px', background: '#450a0a', color: '#ef4444', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 },
  empty: { padding: 80, textAlign: 'center', color: '#475569', fontSize: 15, background: '#1e293b', borderRadius: 16, border: '1px solid #334155' },
};