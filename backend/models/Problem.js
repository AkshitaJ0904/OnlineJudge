import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  input:  { type: String, default: '' },
  output: { type: String, required: true },
});

const problemSchema = new mongoose.Schema({
  code:       { type: String, required: true, unique: true },
  name:       { type: String, required: true },
  statement:  { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  testCases:  [testCaseSchema],
});

export default mongoose.model('Problem', problemSchema);
