const BASE = '/api';

function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeader(), ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    // If 401 and we have a token, it means the token expired — fire a global logout event
    if (res.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.dispatchEvent(new Event('auth:expired'));
    }
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const api = {
  register:             (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:                (body) => request('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  getProblems:          ()     => request('/problems'),
  getProblem:           (id)   => request(`/problems/${id}`),
  submit:               (id, body) => request(`/problems/${id}/submit`, { method: 'POST', body: JSON.stringify(body) }),
  getSubmission:        (id)   => request(`/submissions/${id}`),
  getLeaderboard:       ()     => request('/leaderboard'),
  getRecentSubmissions: ()     => request('/submissions'),
};
