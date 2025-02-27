import mongoose from "mongoose";
import logger from "../utils/logger";

export const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        logger.info("Connected to MongoDB");
    } catch (error) {
        logger.error("connecting to mongoDb failed", error);
    }
};
