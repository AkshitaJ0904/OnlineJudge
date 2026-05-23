import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

const VERDICT_LABEL = {
  AC: 'Accepted', WA: 'Wrong Answer', CE: 'Compile Error',
  TLE: 'Time Limit', RE: 'Runtime Error', Pending: 'Pending',
};

const VERDICT_COLOR = {
  AC: 'var(--green)', WA: 'var(--red)', CE: 'var(--yellow)',
  TLE: 'var(--blue)', RE: 'var(--red)', Pending: 'var(--muted)',
};

function RankCell({ rank }) {
  if (rank === 1) return <span style={{ fontSize: 18 }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: 18 }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: 18 }}>🥉</span>;
  return <span style={{ color: 'var(--muted)', fontWeight: 600, fontSize: 13 }}>{rank}</span>;
}

function ScoreBar({ score, max }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontWeight: 700, color: 'var(--accent)', minWidth: 32, fontSize: 14 }}>{score}</span>
      <div style={{ flex: 1, height: 4, background: 'var(--border2)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 99 }} />
      </div>
    </div>
  );
}

function DiffCount({ count, type }) {
  const colors = { easy: 'var(--green)', medium: 'var(--yellow)', hard: 'var(--red)' };
  return (
    <span style={{ color: colors[type], fontWeight: 600, fontSize: 13 }}>{count}</span>
  );
}

export default function Leaderboard() {
  const [tab, setTab]           = useState('rankings');
  const [rankings, setRankings] = useState([]);
  const [recent, setRecent]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (tab === 'rankings') {
      setLoading(true);
      api.getLeaderboard().then(setRankings).finally(() => setLoading(false));
    } else {
      setLoading(true);
      api.getRecentSubmissions().then(setRecent).finally(() => setLoading(false));
    }
  }, [tab]);

  const maxScore = rankings.length > 0 ? rankings[0].score : 0;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Leaderboard
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Rankings by score — Easy×1 · Medium×3 · Hard×5
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border2)', marginBottom: 20 }}>
        <button className={`btn-tab ${tab === 'rankings' ? 'active' : ''}`} onClick={() => setTab('rankings')}>
          Rankings
        </button>
        <button className={`btn-tab ${tab === 'recent' ? 'active' : ''}`} onClick={() => setTab('recent')}>
          Recent Submissions
        </button>
      </div>

      {loading && <div className="loading">Loading…</div>}

      {/* ── Rankings table ── */}
      {!loading && tab === 'rankings' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 12, overflow: 'hidden' }}>
          {rankings.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
              No accepted submissions yet.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: 60, textAlign: 'center' }}>Rank</th>
                  <th>User</th>
                  <th style={{ width: 180 }}>Score</th>
                  <th style={{ width: 80, textAlign: 'center' }}>Solved</th>
                  <th style={{ width: 72, textAlign: 'center', color: 'var(--green)' }}>Easy</th>
                  <th style={{ width: 72, textAlign: 'center', color: 'var(--yellow)' }}>Med</th>
                  <th style={{ width: 72, textAlign: 'center', color: 'var(--red)' }}>Hard</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((row, i) => (
                  <tr key={row._id} style={{
                    background: i === 0 ? 'rgba(255,215,0,0.04)'
                               : i === 1 ? 'rgba(192,192,192,0.03)'
                               : i === 2 ? 'rgba(205,127,50,0.03)'
                               : 'transparent',
                  }}>
                    <td style={{ textAlign: 'center' }}><RankCell rank={i + 1} /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: `hsl(${(row.username?.charCodeAt(0) ?? 0) * 17 % 360},60%,45%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                        }}>
                          {row.username?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{row.username ?? 'Unknown'}</span>
                      </div>
                    </td>
                    <td><ScoreBar score={row.score} max={maxScore} /></td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--text)' }}>{row.total}</td>
                    <td style={{ textAlign: 'center' }}><DiffCount count={row.easy}   type="easy"   /></td>
                    <td style={{ textAlign: 'center' }}><DiffCount count={row.medium} type="medium" /></td>
                    <td style={{ textAlign: 'center' }}><DiffCount count={row.hard}   type="hard"   /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Recent submissions table ── */}
      {!loading && tab === 'recent' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 12, overflow: 'hidden' }}>
          {recent.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>No submissions yet.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Problem</th>
                  <th style={{ width: 90 }}>Language</th>
                  <th style={{ width: 140 }}>Verdict</th>
                  <th style={{ width: 160 }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(s => (
                  <tr
                    key={s._id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => window.location.href = `/submissions/${s._id}`}
                  >
                    <td style={{ fontWeight: 500 }}>{s.user?.username ?? 'anon'}</td>
                    <td>
                      <Link
                        to={`/problems/${s.problem?._id}`}
                        onClick={e => e.stopPropagation()}
                        style={{ color: 'var(--text)' }}
                      >
                        <span style={{ color: 'var(--muted)', marginRight: 6, fontSize: 12 }}>{s.problem?.code}</span>
                        {s.problem?.name}
                      </Link>
                    </td>
                    <td className="mono" style={{ color: 'var(--muted)', fontSize: 12 }}>{s.language}</td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: 13, color: VERDICT_COLOR[s.verdict] ?? 'var(--muted)' }}>
                        {VERDICT_LABEL[s.verdict] ?? s.verdict}
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>
                      {new Date(s.submittedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
