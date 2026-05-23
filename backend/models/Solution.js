import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
  index:    Number,
  verdict:  String,
  input:    String,
  expected: String,
  actual:   String,
}, { _id: false });

const solutionSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  problem:        { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  code:           { type: String, required: true },
  language:       { type: String, enum: ['C', 'CPP', 'PYTHON'], default: 'C' },
  verdict:        { type: String, enum: ['AC', 'WA', 'CE', 'TLE', 'RE', 'Pending'], default: 'Pending' },
  compilerOutput: { type: String, default: '' },
  testResults:    [testResultSchema],
  submittedAt:    { type: Date, default: Date.now },
});

solutionSchema.index({ submittedAt: -1 });

export default mongoose.model('Solution', solutionSchema);
