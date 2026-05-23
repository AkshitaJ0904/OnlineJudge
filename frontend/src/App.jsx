import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProblemList from './pages/ProblemList.jsx';
import ProblemDetail from './pages/ProblemDetail.jsx';
import SubmissionDetail from './pages/SubmissionDetail.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"                    element={<ProblemList />} />
          <Route path="/problems/:id"        element={<ProblemDetail />} />
          <Route path="/submissions/:id"     element={<SubmissionDetail />} />
          <Route path="/leaderboard"         element={<Leaderboard />} />
          <Route path="/login"               element={<Login />} />
          <Route path="/signup"              element={<Signup />} />
        </Routes>
      </main>
    </AuthProvider>
  );
}
