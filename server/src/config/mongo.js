import mongoose from 'mongoose';

export async function connectMongo(uri) {
  if (!uri) throw new Error('MONGODB_URI missing');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  });
  // eslint-disable-next-line no-console
  console.log('Connected to MongoDB');
}


