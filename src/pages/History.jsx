import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import supabaseClient from "../../API/supabase"
import '../Css/History.css';
import logo from "../assets/logo.png"

const PAGE_SIZE = 5;

const TEST_TYPE_TABS = [
  { key: 'all', label: 'All' },
  { key: 'chapter', label: 'Chapter' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'cee', label: 'CEE' },
];

const SUBJECTS = ['Physics', 'Chemistry', 'Zoology', 'Botany', 'MAT'];

function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s > 0 ? s + 's' : ''}`.trim();
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function AccuracyBar({ accuracy }) {
  const color =
    accuracy >= 75 ? '#16A34A' : accuracy >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="hx-accuracy-bar-wrap">
      <div
        className="hx-accuracy-bar-fill"
        style={{ width: `${accuracy}%`, background: color }}
      />
    </div>
  );
}

// Tiny sparkline using SVG
function Sparkline({ data }) {
  if (!data || data.length < 2) return <span className="hx-spark-na">—</span>;
  const max = Math.max(...data, 1);
  const W = 80, H = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (v / max) * H;
    return `${x},${y}`;
  });
  const last = data[data.length - 1];
  const first = data[0];
  const trending = last >= first;
  return (
    <svg width={W} height={H} className="hx-sparkline">
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={trending ? '#16A34A' : '#ef4444'}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={pts[pts.length - 1].split(',')[0]}
        cy={pts[pts.length - 1].split(',')[1]}
        r="3"
        fill={trending ? '#16A34A' : '#ef4444'}
      />
    </svg>
  );
}

export default function History() {
  const navigate = useNavigate();

  // Filter state
  const [activeTab, setActiveTab] = useState('all');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterChapter, setFilterChapter] = useState('');

  // Data state
  const [attempts, setAttempts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0); // 0-indexed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Trend data: { [subject]: [score_pct, ...] }
  const [trendData, setTrendData] = useState({});

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [activeTab, filterSubject, filterChapter]);

  // Fetch attempts
  const fetchAttempts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) { navigate('/login'); return; }

      let query = supabaseClient
        .from('quiz_attempts')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .gte('time_taken', 300)           // 5-min minimum
        .order('attempted_at', { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

      if (activeTab !== 'all') query = query.eq('test_type', activeTab);
      if (filterSubject) query = query.eq('subject', filterSubject);
      if (filterChapter) query = query.eq('chapter', filterChapter);

      const { data, error: qErr, count } = await query;
      if (qErr) throw qErr;
      setAttempts(data || []);
      setTotalCount(count || 0);
    } catch (e) {
      setError('Failed to load history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, filterSubject, filterChapter, navigate]);

  useEffect(() => { fetchAttempts(); }, [fetchAttempts]);

  // Fetch trend data (last 10 attempts per subject, regardless of filters)
  useEffect(() => {
    async function fetchTrend() {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) return;
      const { data } = await supabaseClient
        .from('quiz_attempts')
        .select('subject, score, total, attempted_at')
        .eq('user_id', user.id)
        .gte('time_taken', 300)
        .order('attempted_at', { ascending: true });
      if (!data) return;
      const map = {};
      data.forEach(a => {
        if (!a.subject || !a.total) return;
        if (!map[a.subject]) map[a.subject] = [];
        map[a.subject].push(Math.round((a.score / a.total) * 100));
      });
      // Keep last 10 per subject
      Object.keys(map).forEach(k => { map[k] = map[k].slice(-10); });
      setTrendData(map);
    }
    fetchTrend();
  }, []);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  function handleRetake(attempt) {
    navigate('/Quiz', {
      state: {
        subject: attempt.subject,
        chapter: attempt.chapter || null,
        section: attempt.section || null,
        test_type: attempt.test_type,
        test_label: attempt.test_label || null,
      },
    });
  }

  function handleReview(attempt) {
    navigate('/result', {
      state: {
        attemptId: attempt.attempt_id,
        reviewMode: true,
      },
    });
  }

  return (
    <div className="hx-wrap">
      {/* ── Sidebar ── */}
      <aside className="hx-sidebar">
        <div className="hx-sidebar-logo">
            <div className="qs-logo-area">
                    <img src={logo} alt="HCM Logo" />
                  </div>
          <span className="hx-sidebar-brand">HighCareMentor</span>
          <span className="hx-sidebar-sub">Attempt History</span>
        </div>

        <nav className="hx-tabs">
          {TEST_TYPE_TABS.map(t => (
            <button
              key={t.key}
              className={`hx-tab-btn ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => { setActiveTab(t.key); setFilterSubject(''); setFilterChapter(''); }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="hx-filter-section">
          <p className="hx-filter-label">Filter by Subject</p>
          <select
            className="hx-select"
            value={filterSubject}
            onChange={e => { setFilterSubject(e.target.value); setFilterChapter(''); }}
          >
            <option value="">All Subjects</option>
            {SUBJECTS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {filterSubject && (
          <div className="hx-filter-section">
            <p className="hx-filter-label">Filter by Chapter</p>
            <input
              className="hx-input"
              placeholder="e.g. Mechanics"
              value={filterChapter}
              onChange={e => setFilterChapter(e.target.value)}
            />
          </div>
        )}

        {/* Trend panel */}
        {Object.keys(trendData).length > 0 && (
          <div className="hx-trend-panel">
            <p className="hx-filter-label" style={{ marginBottom: '12px' }}>Score Trend</p>
            {Object.entries(trendData).map(([subj, pts]) => (
              <div key={subj} className="hx-trend-row">
                <span className="hx-trend-subj">{subj}</span>
                <Sparkline data={pts} />
              </div>
            ))}
          </div>
        )}

        <button className="hx-back-btn" onClick={() => navigate('/QuizSelection')}>
          ← Back to Quiz
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="hx-main">
        <div className="hx-main-header">
          <h1 className="hx-heading">Your Attempts</h1>
          {totalCount > 0 && (
            <span className="hx-count-badge">{totalCount} total</span>
          )}
        </div>

        {error && <div className="hx-error">{error}</div>}

        {loading ? (
          <div className="hx-skeleton-list">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="hx-skeleton-card" />
            ))}
          </div>
        ) : attempts.length === 0 ? (
          <div className="hx-empty">
            <div className="hx-empty-icon">📋</div>
            <h3>No attempts found</h3>
            <p>
              {activeTab !== 'all' || filterSubject
                ? "You haven't taken this type of test yet. Try a different filter."
                : 'Start your first quiz to see history here.'}
            </p>
            <button className="hx-cta-btn" onClick={() => navigate('/QuizSelection')}>
              Take a Quiz
            </button>
          </div>
        ) : (
          <>
            <div className="hx-cards">
              {attempts.map(a => {
                const pct = a.total ? Math.round((a.score / a.total) * 100) : 0;
                const accuracy = a.total ? Math.round(((a.score + (a.total - a.score - (a.total - a.score))) / a.total) * 100) : 0;
                // Accuracy = correct / total attempted (score already accounts for -0.25, so just use score/total * 100)
                const accuracyVal = a.total ? Math.round((a.score / a.total) * 100) : 0;
                const scoreColor = pct >= 70 ? '#16A34A' : pct >= 40 ? '#f59e0b' : '#ef4444';
                const typeLabel = a.test_type === 'cee' ? 'CEE' : a.test_type === 'weekly' ? 'Weekly' : 'Chapter';

                return (
                  <div key={a.attempt_id} className="hx-card">
                    <div className="hx-card-top">
                      <div className="hx-card-left">
                        <span className={`hx-type-badge hx-type-${a.test_type}`}>{typeLabel}</span>
                        <h3 className="hx-card-title">
                          {a.test_label || a.chapter || a.subject || 'Quiz'}
                        </h3>
                        {a.subject && <span className="hx-card-sub">{a.subject}</span>}
                      </div>
                      <div className="hx-card-score-ring">
                        <span className="hx-score-num" style={{ color: scoreColor }}>
                          {a.score}<span className="hx-score-denom">/{a.total}</span>
                        </span>
                      </div>
                    </div>

                    <AccuracyBar accuracy={accuracyVal < 0 ? 0 : accuracyVal} />

                    <div className="hx-card-stats">
                      <div className="hx-stat">
                        <span className="hx-stat-label">Percentage</span>
                        <span className="hx-stat-val" style={{ color: scoreColor }}>{pct}%</span>
                      </div>
                      <div className="hx-stat">
                        <span className="hx-stat-label">Accuracy</span>
                        <span className="hx-stat-val">{accuracyVal < 0 ? 0 : accuracyVal}%</span>
                      </div>
                      <div className="hx-stat">
                        <span className="hx-stat-label">Time</span>
                        <span className="hx-stat-val">{formatDuration(a.time_taken)}</span>
                      </div>
                      <div className="hx-stat">
                        <span className="hx-stat-label">Date</span>
                        <span className="hx-stat-val">{formatDate(a.attempted_at)}</span>
                      </div>
                    </div>

                    <div className="hx-card-actions">
                      <button className="hx-review-btn" onClick={() => handleReview(a)}>
                        Review
                      </button>
                      <button className="hx-retake-btn" onClick={() => handleRetake(a)}>
                        Retake ↗
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="hx-pagination">
                <button
                  className="hx-page-btn"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                >
                  ← Prev
                </button>
                <div className="hx-page-dots">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      className={`hx-dot ${i === page ? 'active' : ''}`}
                      onClick={() => setPage(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  className="hx-page-btn"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}