import mongoose from "mongoose";

const connectDB = async () => {
  // Check if already connected
  if (mongoose.connections[0]?.readyState === 1) {
    return; // already connected
  }
  
  try {
    // If connection is in progress, wait for it
    if (mongoose.connections[0]?.readyState === 2) {
      await new Promise((resolve) => {
        mongoose.connection.once("connected", resolve);
        mongoose.connection.once("error", resolve);
      });
      if (mongoose.connections[0]?.readyState === 1) {
        return;
      }
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    throw error;
  }
};

export { connectDB };