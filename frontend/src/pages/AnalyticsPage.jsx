import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsApi } from '../api';
import { useToast } from '../context/ToastContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { MousePointerClick, Link2, Activity, TrendingUp, BarChart2 } from 'lucide-react';

const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--color-surface-3)', border: '1px solid var(--color-border)',
        borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem',
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
        {payload.map((p) => (
          <div key={p.name} style={{ color: p.color }}>
            {p.name}: {p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [topUrls, setTopUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ovRes, topRes] = await Promise.all([
          analyticsApi.getMyAnalytics(),
          analyticsApi.getTopUrls(5),
        ]);
        setOverview(ovRes.data);
        setTopUrls(topRes.data);
      } catch {
        addToast('Failed to load analytics', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-screen" style={{ minHeight: 300 }}>
          <div className="spinner spinner-lg" />
          <span className="text-muted">Loading analytics…</span>
        </div>
      </div>
    );
  }

  const pieData = overview
    ? [
        { name: 'Active', value: overview.activeUrls },
        { name: 'Inactive', value: overview.inactiveUrls },
      ]
    : [];

  const barData = topUrls.map((u, i) => ({
    name: `Link ${i + 1}`,
    clicks: u.clickCount,
    url: u.shortUrl,
  }));

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Analytics Overview</h1>
        <p className="page-subtitle">Track your link performance at a glance.</p>
      </div>

      {/* Stats */}
      <div className="analytics-grid">
        <StatCard icon={<Link2 size={20} />} label="Total Links" value={overview?.totalUrls ?? 0} color="var(--color-primary)" />
        <StatCard icon={<Activity size={20} />} label="Active Links" value={overview?.activeUrls ?? 0} color="var(--color-success)" />
        <StatCard icon={<TrendingUp size={20} />} label="Inactive Links" value={overview?.inactiveUrls ?? 0} color="var(--color-error)" />
        <StatCard icon={<MousePointerClick size={20} />} label="Total Clicks" value={overview?.totalClicks ?? 0} color="var(--color-secondary)" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 20 }}>
        {/* Bar chart – top URLs */}
        <div className="chart-container">
          <div className="chart-title">Top 5 Links by Clicks</div>
          {barData.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-subtle)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-subtle)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="clicks" fill="var(--color-primary)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart – active vs inactive */}
        <div className="chart-container">
          <div className="chart-title">Link Status Distribution</div>
          {!overview || overview.totalUrls === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top URLs table */}
      {topUrls.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--color-text-muted)' }}>
            Top Performing Links
          </h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Short URL</th>
                  <th>Original URL</th>
                  <th>Clicks</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {topUrls.map((u, i) => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--color-text-subtle)', fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{u.shortUrl}</td>
                    <td>
                      <span className="truncate" title={u.originalUrl} style={{ display: 'block', maxWidth: 240 }}>
                        {u.originalUrl}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-primary">
                        <MousePointerClick size={12} />{u.clickCount}
                      </span>
                    </td>
                    <td>
                      <button
                        id={`analytics-detail-btn-${u.id}`}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--color-secondary)' }}
                        onClick={() => navigate(`/analytics/${u.id}`)}
                      >
                        <BarChart2 size={14} />Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div style={{ color, marginBottom: 4 }}>{icon}</div>
      <div className="stat-value">{value.toLocaleString()}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
