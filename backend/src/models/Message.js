import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    from: { type: String, required: true, lowercase: true },
    to: { type: String, required: true, lowercase: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

messageSchema.index({ from: 1, to: 1, createdAt: -1 });

export default mongoose.models?.Message || mongoose.model('Message', messageSchema);
