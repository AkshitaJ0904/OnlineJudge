import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

const FILTERS = ['All', 'Easy', 'Medium', 'Hard'];

export default function ProblemList() {
  const [problems, setProblems]   = useState([]);
  const [filter, setFilter]       = useState('All');
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');

  useEffect(() => {
    api.getProblems().then(setProblems).finally(() => setLoading(false));
  }, []);

  const easy   = problems.filter(p => p.difficulty === 'Easy');
  const medium = problems.filter(p => p.difficulty === 'Medium');
  const hard   = problems.filter(p => p.difficulty === 'Hard');

  const easySolved   = easy.filter(p => p.solved).length;
  const mediumSolved = medium.filter(p => p.solved).length;
  const hardSolved   = hard.filter(p => p.solved).length;
  const totalSolved  = easySolved + mediumSolved + hardSolved;

  const displayed = problems.filter(p => {
    const matchDiff   = filter === 'All' || p.difficulty === filter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.code.toLowerCase().includes(search.toLowerCase());
    return matchDiff && matchSearch;
  });

  if (loading) return (
    <div className="container" style={{ paddingTop: 48 }}>
      <div className="loading">Loading problems…</div>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <div className="stat-pill" style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}>
          <span className="sp-count" style={{ color: 'var(--text)' }}>{totalSolved}/{problems.length}</span>
          <span className="sp-label" style={{ color: 'var(--muted)' }}>Solved</span>
        </div>
        <div className="stat-pill" style={{ background: 'var(--easy-bg)', border: '1px solid rgba(0,184,163,0.2)' }}>
          <span className="sp-count" style={{ color: 'var(--green)' }}>{easySolved}/{easy.length}</span>
          <span className="sp-label" style={{ color: 'var(--green)', opacity: 0.8 }}>Easy</span>
        </div>
        <div className="stat-pill" style={{ background: 'var(--med-bg)', border: '1px solid rgba(255,184,0,0.2)' }}>
          <span className="sp-count" style={{ color: 'var(--yellow)' }}>{mediumSolved}/{medium.length}</span>
          <span className="sp-label" style={{ color: 'var(--yellow)', opacity: 0.8 }}>Medium</span>
        </div>
        <div className="stat-pill" style={{ background: 'var(--hard-bg)', border: '1px solid rgba(239,71,67,0.2)' }}>
          <span className="sp-count" style={{ color: 'var(--red)' }}>{hardSolved}/{hard.length}</span>
          <span className="sp-label" style={{ color: 'var(--red)', opacity: 0.8 }}>Hard</span>
        </div>
      </div>

      {/* Filters + search row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: '1px solid',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: filter === f ? 'var(--accent)' : 'var(--surface)',
                borderColor: filter === f ? 'var(--accent)' : 'var(--border)',
                color: filter === f ? '#000' : 'var(--muted)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search problems…"
          style={{ width: 220, padding: '7px 12px', fontSize: 13 }}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 12, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 36, textAlign: 'center' }}></th>
              <th style={{ width: 80 }}>Code</th>
              <th>Title</th>
              <th style={{ width: 100 }}>Difficulty</th>
              <th style={{ width: 110 }}>Acceptance</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>
                  No problems found.
                </td>
              </tr>
            )}
            {displayed.map((p, i) => (
              <tr key={p._id} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                <td style={{ textAlign: 'center' }}>
                  {p.solved && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" fill="rgba(0,184,163,0.15)"/>
                      <path d="M5 8l2 2 4-4" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </td>
                <td className="mono" style={{ color: 'var(--muted)', fontSize: 12 }}>{p.code}</td>
                <td>
                  <Link
                    to={`/problems/${p._id}`}
                    style={{
                      color: p.solved ? 'var(--green)' : 'var(--text)',
                      fontWeight: 500,
                      fontSize: 14,
                    }}
                  >
                    {p.name}
                  </Link>
                </td>
                <td>
                  <span className={`badge badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                </td>
                <td style={{ color: 'var(--muted)', fontSize: 13 }}>
                  {p.acceptanceRate !== null ? `${p.acceptanceRate}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
