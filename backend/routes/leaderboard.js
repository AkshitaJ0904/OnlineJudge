import express from 'express';
import Solution from '../models/Solution.js';

const router = express.Router();

// Returns user rankings sorted by score (Easy×1 + Medium×3 + Hard×5), LeetCode-style
router.get('/', async (req, res) => {
  try {
    const rankings = await Solution.aggregate([
      { $match: { verdict: 'AC', user: { $ne: null } } },
      // Deduplicate: one entry per (user, problem) pair
      { $group: { _id: { user: '$user', problem: '$problem' } } },
      // Group by user, collect all solved problem IDs
      { $group: { _id: '$_id.user', problemIds: { $addToSet: '$_id.problem' } } },
      // Join with problems to get difficulty
      { $lookup: { from: 'problems', localField: 'problemIds', foreignField: '_id', as: 'solvedProblems' } },
      {
        $project: {
          total:  { $size: '$solvedProblems' },
          easy:   { $size: { $filter: { input: '$solvedProblems', as: 'p', cond: { $eq: ['$$p.difficulty', 'Easy'] } } } },
          medium: { $size: { $filter: { input: '$solvedProblems', as: 'p', cond: { $eq: ['$$p.difficulty', 'Medium'] } } } },
          hard:   { $size: { $filter: { input: '$solvedProblems', as: 'p', cond: { $eq: ['$$p.difficulty', 'Hard'] } } } },
        },
      },
      // Score: Easy=1pt, Medium=3pt, Hard=5pt
      { $addFields: { score: { $add: [{ $multiply: ['$easy', 1] }, { $multiply: ['$medium', 3] }, { $multiply: ['$hard', 5] }] } } },
      { $match: { total: { $gt: 0 } } },
      { $sort: { score: -1, total: -1 } },
      { $limit: 100 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userInfo' } },
      { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
      { $project: { username: '$userInfo.username', total: 1, easy: 1, medium: 1, hard: 1, score: 1 } },
    ]);

    res.json(rankings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
