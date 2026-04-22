import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: '▦', label: 'Dashboard' },
  { path: '/leads', icon: '◈', label: 'Leads' },
  { path: '/properties', icon: '⊞', label: 'Properties' },
  { path: '/clients', icon: '◉', label: 'Clients' },
  { path: '/deals', icon: '◆', label: 'Deals' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <span style={styles.logoIcon}>🏠</span>
        <div>
          <div style={styles.logoText}>RealEstate</div>
          <div style={styles.logoCRM}>CRM</div>
        </div>
      </div>

      <div style={styles.userBox}>
        <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <div style={styles.userName}>{user?.name}</div>
          <div style={styles.userRole}>{user?.role}</div>
        </div>
        <div style={styles.onlineDot} />
      </div>

      <div style={styles.navSection}>
        <div style={styles.navLabel}>MENU</div>
        <nav style={styles.nav}>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                <div style={{ ...styles.navItem, ...(active ? styles.activeItem : {}) }}>
                  {active && <div style={styles.activeLine} />}
                  <span style={{ ...styles.navIcon, color: active ? '#6366f1' : '#475569' }}>{item.icon}</span>
                  <span style={{ ...styles.navLabel2, color: active ? '#f1f5f9' : '#64748b' }}>{item.label}</span>
                  {active && <div style={styles.activeDot} />}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div style={styles.bottom}>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <span>⎋</span> Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: { width: 230, minHeight: '100vh', background: '#0f172a', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 100 },
  logo: { padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #1e293b' },
  logoIcon: { fontSize: 28 },
  logoText: { fontSize: 15, fontWeight: 800, color: '#f1f5f9', lineHeight: 1 },
  logoCRM: { fontSize: 10, color: '#6366f1', fontWeight: 700, letterSpacing: 3, marginTop: 2 },
  userBox: { padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #1e293b', position: 'relative' },
  avatar: { width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 16, flexShrink: 0 },
  userName: { fontSize: 13, fontWeight: 700, color: '#f1f5f9' },
  userRole: { fontSize: 11, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: '50%', background: '#10b981', position: 'absolute', top: 18, right: 20, boxShadow: '0 0 6px #10b981' },
  navSection: { flex: 1, padding: '20px 12px' },
  navLabel: { fontSize: 10, color: '#334155', fontWeight: 700, letterSpacing: 2, marginBottom: 12, paddingLeft: 8 },
  nav: { display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10, cursor: 'pointer', position: 'relative', transition: 'all 0.15s' },
  activeItem: { background: '#1e293b' },
  activeLine: { position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, background: '#6366f1', borderRadius: 4 },
  navIcon: { fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 },
  navLabel2: { fontSize: 14, fontWeight: 600 },
  activeDot: { width: 6, height: 6, borderRadius: '50%', background: '#6366f1', marginLeft: 'auto' },
  bottom: { padding: '16px 12px', borderTop: '1px solid #1e293b' },
  logoutBtn: { width: '100%', padding: '11px 16px', background: '#1e293b', color: '#64748b', border: '1px solid #334155', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 },
};