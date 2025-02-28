import mongoose from "mongoose";
import logger from "../utils/logger.js";

export const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        logger.info("Connected to MongoDB");
    } catch (error) {
        logger.error("connecting to mongoDb failed", error);
    }
};
