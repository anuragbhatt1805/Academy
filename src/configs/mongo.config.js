import mongoose from "mongoose";
import { DB_NAME, MONGO_URI } from "../constant.js";

const connectDB = async () => {
  try {
    const mongo = await mongoose.connect(`${MONGO_URI}/${DB_NAME}`);
    console.log("MongoDB connected", mongo.connection.host);
  } catch (error) {
    console.log("MongoDB connection error", error);
    process.exit(1);
  }
};

export default connectDB;
