import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { urlApi } from '../api';
import { useToast } from '../context/ToastContext';
import { Link2, Copy, Check, ExternalLink, Calendar, Zap, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [url, setUrl] = useState('');
  const [expiryDays, setExpiryDays] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!url.trim()) { setError('Please enter a URL'); return; }
    if (!/^https?:\/\/.+/.test(url.trim())) { setError('URL must start with http:// or https://'); return; }
    setError('');
    setLoading(true);
    try {
      const payload = { originalUrl: url.trim() };
      if (expiryDays) payload.expiryDays = parseInt(expiryDays, 10);
      const res = await urlApi.shorten(payload);
      setResult(res.data);
      setUrl('');
      setExpiryDays('');
      addToast('Link shortened successfully! 🚀', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to shorten URL';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.shortUrl) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    addToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Shorten a Link</h1>
        <p className="page-subtitle">Paste any URL below and we'll make it short and trackable.</p>
      </div>

      {/* Shorten form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <form id="shorten-form" onSubmit={handleShorten}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="shorten-url-input">Destination URL</label>
              <input
                id="shorten-url-input"
                className={`form-input${error ? ' error' : ''}`}
                type="url"
                placeholder="https://example.com/very/long/url/that/needs/shortening"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(''); }}
                style={{ fontSize: '1.1rem', padding: '16px' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '1 1 200px' }}>
                <label className="form-label" htmlFor="shorten-expiry-input">Expiry Days (Optional)</label>
                <input
                  id="shorten-expiry-input"
                  className="form-input"
                  type="number"
                  placeholder="e.g. 5 (Default:7)"
                  min="1" max="10"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                />
              </div>
              
              <button
                id="shorten-submit-btn"
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={{ flexShrink: 0, minWidth: '160px', justifyContent: 'center' }}
              >
                {loading
                  ? <><span className="spinner" />&nbsp;Shortening…</>
                  : <><Zap size={18} />Shorten URL</>}
              </button>
            </div>
          </div>
          {error && <span className="form-error" style={{ marginTop: 12, display: 'flex' }}>⚠ {error}</span>}
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className="result-box" style={{ marginBottom: 32 }}>
          <div>
            <div className="result-short-url">
              <Link2 size={16} style={{ display: 'inline', marginRight: 6 }} />
              {result.shortUrl}
            </div>
            <div className="result-original" title={result.originalUrl}>{result.originalUrl}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button id="copy-short-url-btn" className="btn btn-secondary" onClick={handleCopy}>
              {copied ? <><Check size={16} />Copied!</> : <><Copy size={16} />Copy</>}
            </button>
            <a id="open-short-url-btn" href={result.shortUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
              <ExternalLink size={16} />Open
            </a>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
        <QuickCard
          icon={<Link2 size={24} />}
          title="My Links"
          desc="View, manage and toggle all your shortened URLs."
          action={() => navigate('/my-urls')}
          color="var(--color-primary)"
        />
        <QuickCard
          icon={<Calendar size={24} />}
          title="Analytics"
          desc="Track clicks, geography and performance metrics."
          action={() => navigate('/analytics')}
          color="var(--color-primary)"
        />
      </div>
    </div>
  );
}

function QuickCard({ icon, title, desc, action, color }) {
  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={action}>
      <div style={{ color, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{title}</div>
      <div className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 16 }}>{desc}</div>
      <button className="btn btn-ghost btn-sm" style={{ color }}>
        Go to {title} <ArrowRight size={14} />
      </button>
    </div>
  );
}
