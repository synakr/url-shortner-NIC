import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi, urlApi } from '../api';
import { useToast } from '../context/ToastContext';
import {
  Link2, Copy, Check, BarChart2, PowerOff, Power,
  ExternalLink, Clock, MousePointerClick, ChevronLeft, ChevronRight, Edit
} from 'lucide-react';

export default function MyUrlsPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [editingUrl, setEditingUrl] = useState(null);
  const [editOriginalUrl, setEditOriginalUrl] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const fetchUrls = async (p = page) => {
    setLoading(true);
    try {
      const res = await userApi.getMyUrls(p, 10);
      setData(res.data);
    } catch {
      addToast('Failed to load your links', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUrls(page); }, [page]);

  const handleToggle = async (id, isActive) => {
    setToggling(id);
    try {
      if (isActive) await urlApi.deactivate(id);
      else          await urlApi.activate(id);
      addToast(`Link ${isActive ? 'deactivated' : 'activated'}!`, 'success');
      fetchUrls(page);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update link', 'error');
    } finally {
      setToggling(null);
    }
  };

  const handleCopy = async (url, id) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    addToast('Copied!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editOriginalUrl.trim()) {
      addToast('URL cannot be empty', 'error');
      return;
    }
    setEditLoading(true);
    try {
      await urlApi.edit(editingUrl.id, { originalUrl: editOriginalUrl.trim() });
      addToast('URL updated successfully!', 'success');
      setEditingUrl(null);
      fetchUrls(page);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update URL', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  if (loading && !data) {
    return (
      <div className="page-content">
        <div className="loading-screen" style={{ minHeight: 300 }}>
          <div className="spinner spinner-lg" />
          <span className="text-muted">Loading your links…</span>
        </div>
      </div>
    );
  }

  const urls = data?.urls ?? [];

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">My Links</h1>
        <p className="page-subtitle">
          {data?.totalElements ?? 0} link{data?.totalElements !== 1 ? 's' : ''} total
        </p>
      </div>

      {urls.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔗</div>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>No links yet</p>
          <p style={{ fontSize: '0.875rem' }}>Go to Dashboard and shorten your first URL!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {urls.map((u) => (
            <div key={u.id} className="url-card">
              <div className="url-card-header">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="url-short">
                    <Link2 size={16} />
                    <span>{u.shortUrl}</span>
                  </div>
                  <div className="url-original" title={u.originalUrl}>{u.originalUrl}</div>
                </div>
                <span className={`badge ${u.isActive ? 'badge-success' : 'badge-error'}`}>
                  {u.isActive ? '● Active' : '● Inactive'}
                </span>
              </div>

              <div className="url-meta">
                <span className="url-meta-item"><MousePointerClick size={14} />{u.clickCount ?? 0} clicks</span>
                <span className="url-meta-item"><Clock size={14} />Created {fmt(u.createdAt)}</span>
                {u.expiresAt && (
                  <span className="url-meta-item" style={{ color: 'var(--color-warning)' }}>
                    <Clock size={14} />Expires {fmt(u.expiresAt)}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  id={`copy-btn-${u.id}`}
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopy(u.shortUrl, u.id)}
                >
                  {copiedId === u.id ? <><Check size={14} />Copied</> : <><Copy size={14} />Copy</>}
                </button>
                <button
                  id={`edit-btn-${u.id}`}
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setEditingUrl(u);
                    setEditOriginalUrl(u.originalUrl);
                  }}
                >
                  <Edit size={14} />Edit
                </button>
                <a
                  id={`open-btn-${u.id}`}
                  href={u.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  <ExternalLink size={14} />Open
                </a>
                <button
                  id={`analytics-btn-${u.id}`}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-secondary)' }}
                  onClick={() => navigate(`/analytics/${u.id}`)}
                >
                  <BarChart2 size={14} />Analytics
                </button>
                <button
                  id={`toggle-btn-${u.id}`}
                  className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                  onClick={() => handleToggle(u.id, u.isActive)}
                  disabled={toggling === u.id}
                >
                  {toggling === u.id
                    ? <span className="spinner" />
                    : u.isActive
                      ? <><PowerOff size={14} />Deactivate</>
                      : <><Power size={14} />Activate</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="pagination">
          <button
            id="prev-page-btn"
            className="page-btn"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: data.totalPages }, (_, i) => (
            <button
              key={i}
              id={`page-btn-${i}`}
              className={`page-btn${page === i ? ' active' : ''}`}
              onClick={() => setPage(i)}
            >
              {i + 1}
            </button>
          ))}
          <button
            id="next-page-btn"
            className="page-btn"
            disabled={data.last}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {editingUrl && (
        <div className="modal-overlay" onClick={() => setEditingUrl(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>Edit URL</h2>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                Update the original destination for {editingUrl.shortUrl}
              </p>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-url-input">Original URL</label>
                <input
                  id="edit-url-input"
                  type="url"
                  className="form-input"
                  value={editOriginalUrl}
                  onChange={(e) => setEditOriginalUrl(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUrl(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  {editLoading ? <><span className="spinner" /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
