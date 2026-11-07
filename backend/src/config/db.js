import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI is not set");
    await mongoose.connect(mongoUri);
    // Make sure the unique email index exists before the first sign-up.
    await mongoose.connection.syncIndexes();
    console.log("MongoDB database Connected");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};
