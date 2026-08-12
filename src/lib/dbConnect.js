import mongoose from "mongoose";
import {
  buildMongoUriWithDb,
  resolveDatabaseName,
} from "@/lib/siteDatabase";

const globalForMongoose = globalThis;

if (!globalForMongoose.__mongooseCache) {
  globalForMongoose.__mongooseCache = {
    uri: null,
    promise: null,
  };
}

const connectionOptions = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxIdleTimeMS: 60000,
  bufferCommands: true,
};

/**
 * Connect to MongoDB for the current website (domain → database via SITE_DB_MAP).
 * Safe for Next.js parallel static generation: concurrent callers share one promise
 * and we never disconnect mid-flight for the same URI.
 */
const connectDB = async (request) => {
  const dbName = await resolveDatabaseName(request);
  const targetUri = buildMongoUriWithDb(dbName);

  if (!targetUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  const cache = globalForMongoose.__mongooseCache;

  // Already connected to the right database
  if (cache.uri === targetUri && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Connection in progress for the same URI — reuse it
  if (cache.uri === targetUri && cache.promise) {
    return cache.promise;
  }

  // Switching databases: wait for any in-flight connect, then disconnect once
  if (cache.uri && cache.uri !== targetUri) {
    if (cache.promise) {
      try {
        await cache.promise;
      } catch {
        // previous connect failed; continue to new URI
      }
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    cache.uri = null;
    cache.promise = null;
  }

  cache.uri = targetUri;
  cache.promise = mongoose
    .connect(targetUri, connectionOptions)
    .then((m) => {
      try {
        m.connection.setMaxListeners?.(50);
      } catch {
        // ignore
      }
      if (process.env.NODE_ENV === "development") {
        console.log(`✅ MongoDB connected → ${dbName || "default"}`);
      }
      return m.connection;
    })
    .catch((err) => {
      cache.promise = null;
      cache.uri = null;
      throw err;
    });

  return cache.promise;
};

export { connectDB };
