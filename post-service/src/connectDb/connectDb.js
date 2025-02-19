//connect to mongodb
import mongoose from "mongoose";
import logger from "../utils/logger";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        logger.info("Connected to MongoDB");
    } catch (err) {
        logger.error(err, "Error connecting to MongoDB");
    }
};

export default connectDb;
