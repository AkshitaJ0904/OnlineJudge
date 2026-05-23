import express from 'express';
import Solution from '../models/Solution.js';

const router = express.Router();

// Recent submissions feed (latest 20)
router.get('/', async (req, res) => {
  try {
    const submissions = await Solution.find()
      .sort({ submittedAt: -1 })
      .limit(20)
      .populate('user', 'username')
      .populate('problem', 'code name');
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id)
      .populate('user', 'username')
      .populate('problem', 'code name');
    if (!solution) return res.status(404).json({ error: 'Submission not found' });
    res.json(solution);
  } catch {
    res.status(404).json({ error: 'Submission not found' });
  }
});

export default router;
