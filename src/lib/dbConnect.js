import mongoose from "mongoose";
import {
  buildMongoUriWithDb,
  resolveDatabaseName,
} from "@/lib/siteDatabase";

const globalForMongoose = global;

const connectionOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxIdleTimeMS: 30000,
};

/**
 * Connect to MongoDB for the current website (domain → database via SITE_DB_MAP).
 * Falls back to the database name in MONGODB_URI when domain is not mapped.
 */
const connectDB = async (request) => {
  const dbName = await resolveDatabaseName(request);
  const targetUri = buildMongoUriWithDb(dbName);

  if (!targetUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (
    globalForMongoose.mongooseUri === targetUri &&
    mongoose.connection.readyState === 1
  ) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(targetUri, connectionOptions);
  globalForMongoose.mongooseUri = targetUri;

  if (process.env.NODE_ENV === "development") {
    console.log(`✅ MongoDB connected → ${dbName || "default"}`);
  }

  return mongoose.connection;
};

export { connectDB };
