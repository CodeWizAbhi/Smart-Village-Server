import mongoose from 'mongoose';
import { config } from './env';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export const connectDB = async () => {
  try {
    let mongoUri = config.mongoUri;

    // Use memory server if local and no mongo install
    if (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
      console.log('Starting In-Memory MongoDB Server...');
      mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log(`Using In-Memory Database: ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('Unknown error connecting to database');
    }
    process.exit(1);
  }
};
