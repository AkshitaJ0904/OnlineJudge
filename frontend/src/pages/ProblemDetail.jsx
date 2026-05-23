import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const LANGUAGES = [
  { value: 'C',      label: 'C' },
  { value: 'CPP',    label: 'C++' },
  { value: 'PYTHON', label: 'Python 3' },
];

const PLACEHOLDERS = {
  C:      '#include <stdio.h>\nint main() {\n    \n    return 0;\n}',
  CPP:    '#include <iostream>\nusing namespace std;\nint main() {\n    \n    return 0;\n}',
  PYTHON: '# your solution here\n',
};

const DIFF_COLOR = { Easy: 'var(--green)', Medium: 'var(--yellow)', Hard: 'var(--red)' };

export default function ProblemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [problem, setProblem]       = useState(null);
  const [code, setCode]             = useState(PLACEHOLDERS.CPP);
  const [language, setLanguage]     = useState('CPP');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    api.getProblem(id).then(setProblem).catch(() => navigate('/'));
  }, [id]);

  function handleLangChange(e) {
    setLanguage(e.target.value);
    setCode(PLACEHOLDERS[e.target.value]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setError('');
    setSubmitting(true);
    try {
      const { submissionId } = await api.submit(id, { code, language });
      navigate(`/submissions/${submissionId}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (!problem) return (
    <div className="container" style={{ paddingTop: 48 }}>
      <div className="loading">Loading problem…</div>
    </div>
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 0,
      height: 'calc(100vh - 56px)',
      overflow: 'hidden',
    }}>

      {/* ── Left: Problem statement ── */}
      <div style={{
        borderRight: '1px solid var(--border2)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Problem header */}
        <div style={{
          padding: '20px 24px 0',
          borderBottom: '1px solid var(--border2)',
          background: 'var(--surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Link to="/" style={{ color: 'var(--muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Problem List
            </Link>
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.01em' }}>
            {problem.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16 }}>
            <span className="mono" style={{ color: 'var(--muted)', fontSize: 12 }}>{problem.code}</span>
            <span
              style={{
                fontSize: 12, fontWeight: 600,
                color: DIFF_COLOR[problem.difficulty],
                background: `rgba(${problem.difficulty === 'Easy' ? '0,184,163' : problem.difficulty === 'Medium' ? '255,184,0' : '239,71,67'},0.1)`,
                padding: '2px 10px',
                borderRadius: 99,
              }}
            >
              {problem.difficulty}
            </span>
          </div>
        </div>

        {/* Statement body */}
        <div style={{ padding: '24px', flex: 1 }}>
          <pre style={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            fontSize: 14,
            lineHeight: 1.75,
            color: 'var(--text)',
          }}>
            {problem.statement}
          </pre>
        </div>
      </div>

      {/* ── Right: Code editor ── */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
        {/* Editor toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border2)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 4l4 3-4 3M7 10h5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>Code</span>
          </div>
          <select
            value={language}
            onChange={handleLangChange}
            style={{ width: 'auto', padding: '5px 10px', fontSize: 12, borderRadius: 6 }}
          >
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        {/* Textarea editor */}
        <textarea
          className="mono"
          value={code}
          onChange={e => setCode(e.target.value)}
          spellCheck={false}
          style={{
            flex: 1,
            resize: 'none',
            fontSize: 13,
            lineHeight: 1.65,
            padding: '16px 20px',
            background: '#0d0d0f',
            border: 'none',
            borderRadius: 0,
            color: 'var(--text)',
            outline: 'none',
            minHeight: 0,
          }}
        />

        {/* Submit bar */}
        <div style={{
          padding: '12px 16px',
          background: 'var(--surface)',
          borderTop: '1px solid var(--border2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 13 }}>
            {error && <span style={{ color: 'var(--red)' }}>{error}</span>}
            {!user && (
              <span style={{ color: 'var(--muted)' }}>
                <Link to="/login">Sign in</Link> to submit
              </span>
            )}
          </div>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={submitting || !user}
            style={{ padding: '9px 28px', fontSize: 14, fontWeight: 600, minWidth: 120 }}
          >
            {submitting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 12, height: 12,
                  border: '2px solid rgba(0,0,0,0.3)',
                  borderTopColor: '#000',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }}/>
                Evaluating…
              </span>
            ) : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
