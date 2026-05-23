# AlgoUniversity — Online Judge

A full-stack Online Judge built with the MERN stack. Supports C, C++, and Python submissions with isolated Docker-based code execution, JWT authentication, and a LeetCode-style leaderboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Vite |
| Backend | Node.js, Express.js (ES Modules) |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Code Execution | Docker (`gcc` image) + Node.js `child_process` |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│  React SPA (Vite, port 5173)                            │
│  Pages: Problems / Problem Detail / Leaderboard /       │
│         Submission Detail / Login / Signup              │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP /api/* (proxied by Vite)
┌──────────────────────▼──────────────────────────────────┐
│                  Express Backend (port 5000)             │
│  Routes:                                                │
│    POST /api/auth/register  — signup                    │
│    POST /api/auth/login     — login, returns JWT        │
│    GET  /api/problems       — list all problems         │
│    GET  /api/problems/:id   — problem detail            │
│    POST /api/problems/:id/submit — run & judge code     │
│    GET  /api/submissions/:id — submission result        │
│    GET  /api/submissions    — recent submissions feed   │
│    GET  /api/leaderboard    — ranked scores             │
└──────────────────────┬──────────────────────────────────┘
          ┌────────────┴──────────────┐
          │                           │
┌─────────▼──────────┐   ┌───────────▼──────────────────┐
│  MongoDB Atlas /   │   │  Docker Container (oj-gcc)    │
│  Local MongoDB     │   │                              │
│                    │   │  • Compiles C/C++ with gcc   │
│  Collections:      │   │  • Runs binary with input    │
│  • users           │   │  • 5s time limit (SIGTERM)   │
│  • problems        │   │  • Isolated filesystem       │
│  • solutions       │   │  • Python runs on host       │
└────────────────────┘   └──────────────────────────────┘
```

---

## Features

- **Code Editor** — write and submit C, C++, or Python solutions
- **Auto Judge** — compiles and runs against hidden test cases, returns AC / WA / TLE / CE / RE
- **Leaderboard** — score-based rankings (Easy×1, Medium×3, Hard×5), deduplicates re-submissions
- **Submission History** — per-test-case results with input/expected/actual output
- **JWT Auth** — stateless auth with 7-day tokens, auto-logout on expiry
- **25 Problems** — Easy, Medium, Hard across arrays, strings, DP, graphs

---

## Project Structure

```
onlinejudge-mern/
├── backend/
│   ├── evaluator/index.js      # Docker + local code execution engine
│   ├── middleware/auth.js       # JWT middleware (requireAuth, optionalAuth)
│   ├── models/
│   │   ├── User.js              # username, password (hashed)
│   │   ├── Problem.js           # code, name, statement, difficulty, testCases[]
│   │   └── Solution.js          # user, problem, code, language, verdict, testResults[]
│   ├── routes/
│   │   ├── auth.js              # register / login
│   │   ├── problems.js          # list, detail, submit
│   │   ├── submissions.js       # get by id, recent feed
│   │   └── leaderboard.js       # aggregation pipeline for rankings
│   ├── seed/seed.js             # 25 seeded problems
│   └── server.js                # Express app + MongoDB connection
└── frontend/
    ├── public/logo.png          # AlgoUniversity logo
    ├── src/
    │   ├── api.js               # fetch wrapper with JWT + auto-logout
    │   ├── context/AuthContext.jsx
    │   ├── components/Navbar.jsx
    │   └── pages/
    │       ├── ProblemList.jsx
    │       ├── ProblemDetail.jsx
    │       ├── Leaderboard.jsx
    │       ├── SubmissionDetail.jsx
    │       ├── Login.jsx
    │       └── Signup.jsx
    └── vite.config.js           # /api proxy to port 5000
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas URI)
- Docker (for C/C++ execution)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/AkshitaJ0904/OnlineJudge.git
cd OnlineJudge

# 2. Backend
cd backend
npm install
# Create .env file:
# MONGO_URI=mongodb://localhost:27017/onlinejudge
# JWT_SECRET=your_secret_here
# PORT=5000
node seed/seed.js    # seed 25 problems
node server.js       # start backend

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev          # starts on http://localhost:5173
```

### Docker (for C/C++ execution)

```bash
docker pull gcc
docker run --name oj-gcc -d gcc sleep infinity
```

The backend will automatically detect and use the Docker container. If Docker is not running, C/C++ falls back to local `gcc`/`g++`.

---

## Database Schema

**users** — `{ username, password (bcrypt hash) }`

**problems** — `{ code, name, statement, difficulty, testCases: [{ input, output }] }`

**solutions** — `{ user → users, problem → problems, code, language, verdict, compilerOutput, testResults: [{ index, verdict, input, expected, actual }], submittedAt }`

---

## Scoring (Leaderboard)

| Difficulty | Points |
|---|---|
| Easy | 1 |
| Medium | 3 |
| Hard | 5 |

Only first AC per problem counts. Re-submissions don't affect score.

---

## Verdicts

| Verdict | Meaning |
|---|---|
| AC | All test cases passed |
| WA | Wrong answer on at least one test case |
| TLE | Exceeded 5 second time limit |
| CE | Compilation error |
| RE | Runtime error / non-zero exit |
