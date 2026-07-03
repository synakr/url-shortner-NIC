import { useState, useEffect } from 'react';
import { adminApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navigate } from 'react-router-dom';
import { Shield, Power, PowerOff, Users } from 'lucide-react';

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const { addToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [search, setSearch] = useState('');

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAllUsers();
      setUsers(res.data);
    } catch {
      addToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggle = async (id, isActive, role) => {
    if (role === 'ADMIN' && isActive) {
      addToast('Cannot deactivate an admin account', 'error');
      return;
    }
    setToggling(id);
    try {
      if (isActive) await adminApi.deactivateUser(id);
      else          await adminApi.activateUser(id);
      addToast(`User ${isActive ? 'deactivated' : 'activated'}!`, 'success');
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setToggling(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount   = users.filter((u) => u.isActive).length;
  const inactiveCount = users.filter((u) => !u.isActive).length;

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={28} style={{ color: 'var(--color-primary)' }} />
          User Management
        </h1>
        <p className="page-subtitle">Admin panel — manage all registered users.</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="stat-card" style={{ flex: '1 1 140px' }}>
          <div style={{ color: 'var(--color-primary)' }}><Users size={18} /></div>
          <div className="stat-value" style={{ fontSize: '1.6rem' }}>{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card" style={{ flex: '1 1 140px' }}>
          <div style={{ color: 'var(--color-success)' }}><Power size={18} /></div>
          <div className="stat-value" style={{ fontSize: '1.6rem' }}>{activeCount}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card" style={{ flex: '1 1 140px' }}>
          <div style={{ color: 'var(--color-error)' }}><PowerOff size={18} /></div>
          <div className="stat-value" style={{ fontSize: '1.6rem' }}>{inactiveCount}</div>
          <div className="stat-label">Inactive</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          id="admin-search-input"
          className="form-input"
          type="text"
          placeholder="Search by username or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 380 }}
        />
      </div>

      {loading ? (
        <div className="loading-screen" style={{ minHeight: 200 }}>
          <div className="spinner spinner-lg" />
          <span className="text-muted">Loading users…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <p style={{ fontWeight: 600 }}>No users found</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--color-text-subtle)', fontSize: '0.82rem' }}>#{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.username}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-warning' : 'badge-primary'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-success' : 'badge-error'}`}>
                      {u.isActive ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      id={`admin-toggle-user-${u.id}`}
                      className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                      disabled={toggling === u.id || u.role === 'ADMIN'}
                      onClick={() => handleToggle(u.id, u.isActive, u.role)}
                      title={u.role === 'ADMIN' ? 'Cannot modify admin accounts' : ''}
                    >
                      {toggling === u.id
                        ? <span className="spinner" />
                        : u.isActive
                          ? <><PowerOff size={14} />Deactivate</>
                          : <><Power size={14} />Activate</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
