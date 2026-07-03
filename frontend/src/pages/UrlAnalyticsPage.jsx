import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analyticsApi } from '../api';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft, MousePointerClick, Globe, MapPin,
  Monitor, Clock, ChevronLeft, ChevronRight,
} from 'lucide-react';

export default function UrlAnalyticsPage() {
  const { urlId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async (p = 0) => {
    setLoading(true);
    try {
      const res = await analyticsApi.getUrlAnalytics(urlId, p, 10);
      setData(res.data);
    } catch {
      addToast('Failed to load URL analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(page); }, [urlId, page]);

  const fmt = (d) =>
    d
      ? new Date(d).toLocaleString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : '—';

  if (loading && !data) {
    return (
      <div className="page-content">
        <div className="loading-screen" style={{ minHeight: 300 }}>
          <div className="spinner spinner-lg" />
          <span className="text-muted">Loading click data…</span>
        </div>
      </div>
    );
  }

  const clicks = data?.clicks?.content ?? [];
  const totalPages = data?.clicks?.totalPages ?? 1;

  return (
    <div className="page-content">
      {/* Back */}
      <button
        id="back-to-analytics-btn"
        className="btn btn-ghost btn-sm"
        onClick={() => navigate(-1)}
        style={{ marginBottom: 20 }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="page-header">
        <h1 className="page-title">Link Analytics</h1>
        <p className="page-subtitle" style={{ wordBreak: 'break-all' }}>
          Short code: <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{data?.shortCode}</span>
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
        <MiniStat icon={<MousePointerClick size={18} />} label="Total Clicks" value={data?.clickCount ?? 0} color="var(--color-primary)" />
        <MiniStat
          icon={<span style={{ fontSize: 18 }}>{data?.isActive ? '✅' : '❌'}</span>}
          label="Status"
          value={data?.isActive ? 'Active' : 'Inactive'}
          color={data?.isActive ? 'var(--color-success)' : 'var(--color-error)'}
        />
      </div>

      {/* Click log table */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 12 }}>
          Click Log
        </h2>
        {clicks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🖱️</div>
            <p style={{ fontWeight: 600 }}>No clicks yet</p>
            <p style={{ fontSize: '0.85rem' }}>Share your link to start tracking!</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th><Globe size={14} style={{ display: 'inline', marginRight: 4 }} />Country</th>
                  <th><MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />City</th>
                  <th><Monitor size={14} style={{ display: 'inline', marginRight: 4 }} />Referer</th>
                  <th><Clock size={14} style={{ display: 'inline', marginRight: 4 }} />Clicked At</th>
                </tr>
              </thead>
              <tbody>
                {clicks.map((c, i) => (
                  <tr key={i}>
                    <td>{c.country || '—'}</td>
                    <td>{c.city    || '—'}</td>
                    <td>
                      <span
                        className="truncate"
                        title={c.referer}
                        style={{ display: 'block', maxWidth: 200, color: 'var(--color-text-muted)' }}
                      >
                        {c.referer || 'Direct'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-text-subtle)', fontSize: '0.82rem' }}>
                      {fmt(c.clickedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            id="clicks-prev-btn"
            className="page-btn"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              id={`clicks-page-btn-${i}`}
              className={`page-btn${page === i ? ' active' : ''}`}
              onClick={() => setPage(i)}
            >
              {i + 1}
            </button>
          ))}
          <button
            id="clicks-next-btn"
            className="page-btn"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function MiniStat({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div style={{ color }}>{icon}</div>
      <div className="stat-value" style={{ fontSize: '1.6rem' }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
