import express from 'express';
import Problem from '../models/Problem.js';
import Solution from '../models/Solution.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { evaluate } from '../evaluator/index.js';

const router = express.Router();

// GET /api/problems — list with acceptance rate + solved flag
router.get('/', optionalAuth, async (req, res) => {
  try {
    const problems = await Problem.find({}, 'code name difficulty');

    const stats = await Solution.aggregate([
      { $group: { _id: '$problem', total: { $sum: 1 }, ac: { $sum: { $cond: [{ $eq: ['$verdict', 'AC'] }, 1, 0] } } } },
    ]);
    const statsMap = Object.fromEntries(stats.map(s => [s._id.toString(), s]));

    let solvedSet = new Set();
    if (req.user) {
      const solved = await Solution.find({ user: req.user.id, verdict: 'AC' }, 'problem');
      solved.forEach(s => solvedSet.add(s.problem.toString()));
    }

    const result = problems.map(p => {
      const s = statsMap[p._id.toString()] || { total: 0, ac: 0 };
      return {
        _id: p._id,
        code: p.code,
        name: p.name,
        difficulty: p.difficulty,
        totalSubmissions: s.total,
        acceptedSubmissions: s.ac,
        acceptanceRate: s.total ? Math.round((s.ac / s.total) * 100) : null,
        solved: solvedSet.has(p._id.toString()),
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/problems/:id
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    // Don't expose test cases to client
    const { testCases, ...rest } = problem.toObject();
    res.json(rest);
  } catch {
    res.status(404).json({ error: 'Problem not found' });
  }
});

// POST /api/problems/:id/submit
router.post('/:id/submit', requireAuth, async (req, res) => {
  const { code, language } = req.body;
  if (!code || !language) return res.status(400).json({ error: 'code and language required' });

  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    const solution = await Solution.create({
      user: req.user.id,
      problem: problem._id,
      code,
      language,
      verdict: 'Pending',
    });

    const { verdict, compilerOutput, testResults } = await evaluate(code, problem.testCases, language);

    solution.verdict = verdict;
    solution.compilerOutput = compilerOutput;
    solution.testResults = testResults;
    await solution.save();

    res.json({ submissionId: solution._id, verdict });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
