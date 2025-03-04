import mongoose from "mongoose";
import logger from "../utils/logger";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        logger.info("Connected to MongoDB");
    } catch (error) {
        logger.error("Error connecting to MongoDB", error);
    }
};

export default connectDb;
