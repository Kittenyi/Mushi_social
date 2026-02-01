import mongoose from 'mongoose';

const locationSnapshotSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  h3Index: { type: String, required: true },
  ghostMode: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('LocationSnapshot', locationSnapshotSchema);
