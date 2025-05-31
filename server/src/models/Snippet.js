import mongoose from 'mongoose';

const snippetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: [
        'javascript',
        'python',
        'java',
        'c++',
        'ruby',
        'swift',
        'go',
        'php',
        'typescript',
        'rust',
        'sql',
        'bash',
      ],
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Snippet', snippetSchema);
