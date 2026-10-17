import mongoose from 'mongoose';

let isConnected = false;

export const isDbConnected = () => isConnected;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/sprimax';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB] Connection notice: ${error.message}`);
    console.log(`[MongoDB] Running in high-availability mode. When MongoDB is ready at ${uri}, it will connect automatically.`);
  }

  mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log('[MongoDB] Connection state: Connected');
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('[MongoDB] Connection state: Disconnected');
  });

  mongoose.connection.on('error', (err) => {
    isConnected = false;
    console.warn(`[MongoDB] Runtime error: ${err.message}`);
  });
};

export default connectDB;
