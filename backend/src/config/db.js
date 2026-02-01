import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mushi_social';
  if (!process.env.MONGODB_URI) {
    console.info('[db] 使用默认 MongoDB 地址，如需自定义请复制 backend/.env.example 为 .env');
  }
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

export default connectDB;
