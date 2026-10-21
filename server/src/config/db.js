import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectToDatabase() {
  if (!env.mongoUri) {
    throw new Error("MONGODB_URI is required to start the server.");
  }

  await mongoose.connect(env.mongoUri);
}
