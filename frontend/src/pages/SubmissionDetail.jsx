import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';

const VERDICT_LABEL = {
  AC: 'Accepted', WA: 'Wrong Answer', CE: 'Compilation Error',
  TLE: 'Time Limit Exceeded', RE: 'Runtime Error', Pending: 'Pending',
};

const VERDICT_BG = {
  AC:  'rgba(0,184,163,0.08)',  WA:  'rgba(239,71,67,0.08)',
  CE:  'rgba(255,184,0,0.08)',  TLE: 'rgba(96,165,250,0.08)',
  RE:  'rgba(239,71,67,0.08)',  Pending: 'rgba(139,139,150,0.08)',
};

const VERDICT_COLOR = {
  AC: 'var(--green)', WA: 'var(--red)', CE: 'var(--yellow)',
  TLE: 'var(--blue)', RE: 'var(--red)', Pending: 'var(--muted)',
};

export default function SubmissionDetail() {
  const { id } = useParams();
  const [sub, setSub]         = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.getSubmission(id).then(s => { setSub(s); setSelected(s.testResults?.[0] ?? null); });
  }, [id]);

  if (!sub) return (
    <div className="container" style={{ paddingTop: 48 }}>
      <div className="loading">Loading submission…</div>
    </div>
  );

  const acCount = sub.testResults.filter(t => t.verdict === 'AC').length;
  const total   = sub.testResults.length;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48, maxWidth: 860 }}>

      {/* Breadcrumb */}
      <Link
        to={`/problems/${sub.problem?._id}`}
        style={{ color: 'var(--muted)', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 24 }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {sub.problem?.code} — {sub.problem?.name}
      </Link>

      {/* Verdict card */}
      <div style={{
        background: VERDICT_BG[sub.verdict] ?? 'var(--surface)',
        border: `1px solid ${VERDICT_COLOR[sub.verdict]}33`,
        borderRadius: 14,
        padding: '20px 24px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
            Result
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: VERDICT_COLOR[sub.verdict] }}>
            {VERDICT_LABEL[sub.verdict] ?? sub.verdict}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          <Stat label="User"     value={sub.user?.username ?? 'anon'} />
          <Stat label="Language" value={sub.language} mono />
          {total > 0 && (
            <Stat
              label="Tests passed"
              value={`${acCount} / ${total}`}
              color={acCount === total ? 'var(--green)' : 'var(--red)'}
            />
          )}
          <Stat label="Submitted" value={new Date(sub.submittedAt).toLocaleString()} muted />
        </div>
      </div>

      {/* Test progress bar */}
      {total > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'var(--muted)' }}>
            <span>Test cases</span>
            <span>{acCount}/{total} passed</span>
          </div>
          <div style={{ height: 6, background: 'var(--border2)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${total > 0 ? (acCount / total) * 100 : 0}%`,
              background: acCount === total ? 'var(--green)' : 'var(--red)',
              borderRadius: 99,
              transition: 'width 0.4s',
            }} />
          </div>
        </div>
      )}

      {/* Compiler error */}
      {sub.compilerOutput && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-label">Compiler Output</div>
          <div className="error-block">{sub.compilerOutput}</div>
        </div>
      )}

      {/* Test case pills */}
      {total > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-label">Test Cases</div>
          <div className="tc-pills">
            {sub.testResults.map(tc => (
              <button
                key={tc.index}
                type="button"
                className={`tc-pill ${tc.verdict}`}
                onClick={() => setSelected(tc)}
                style={{ outline: selected?.index === tc.index ? '2px solid var(--accent)' : 'none', outlineOffset: 2 }}
              >
                #{tc.index} {tc.verdict}
              </button>
            ))}
          </div>

          {selected && (
            <div className="tc-row">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                <div>
                  <h4>Input</h4>
                  <pre>{selected.input || '(empty)'}</pre>
                </div>
                <div>
                  <h4>Expected</h4>
                  <pre>{selected.expected}</pre>
                </div>
                <div>
                  <h4>Your Output</h4>
                  <pre style={{ color: selected.verdict === 'AC' ? 'var(--green)' : 'var(--red)' }}>
                    {selected.actual}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submitted code */}
      <div>
        <div className="section-label">Submitted Code</div>
        <div className="code-block">{sub.code}</div>
      </div>
    </div>
  );
}

function Stat({ label, value, mono, color, muted }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{
        fontSize: 14, fontWeight: 600,
        color: color ?? (muted ? 'var(--muted)' : 'var(--text)'),
        fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit',
      }}>
        {value}
      </div>
    </div>
  );
}
