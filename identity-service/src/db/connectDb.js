import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDb = async () => {
    await mongoose
        .connect(process.env.MONGODB_URI)
        .then(() => {
            logger.info("Connected to MongoDB");
        })
        .catch((err) => {
            logger.error("Error connecting to MongoDB", err);
        });
};

export default connectDb;
