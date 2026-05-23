import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Logo() {
  return (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
      <img src="/logo.png" alt="AlgoUniversity" style={{ width: 36, height: 36, objectFit: 'contain' }} />
      <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>
        <span style={{ color: '#e8333a' }}>Algo</span>
        <span style={{ color: '#fff' }}>University</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const navLink = (to, label) => (
    <Link
      to={to}
      style={{
        color: pathname === to ? '#fff' : 'var(--muted)',
        fontSize: 14,
        fontWeight: pathname === to ? 600 : 400,
        transition: 'color 0.15s',
        padding: '4px 0',
        borderBottom: pathname === to ? '2px solid var(--accent)' : '2px solid transparent',
      }}
    >
      {label}
    </Link>
  );

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border2)',
      padding: '0 28px',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <Logo />
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', height: 56 }}>
          {navLink('/', 'Problems')}
          {navLink('/leaderboard', 'Leaderboard')}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {user ? (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--surface2)', borderRadius: 8,
              padding: '5px 12px', border: '1px solid var(--border2)',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: 'var(--accent)', color: '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
              }}>
                {user.username[0].toUpperCase()}
              </div>
              <span style={{ color: 'var(--text)', fontSize: 13, fontWeight: 500 }}>{user.username}</span>
            </div>
            <button className="btn-ghost" style={{ padding: '5px 14px', fontSize: 13 }} onClick={handleLogout}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button className="btn-ghost" style={{ padding: '6px 16px' }}>Sign in</button>
            </Link>
            <Link to="/signup">
              <button className="btn-primary" style={{ padding: '6px 16px' }}>Register</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
