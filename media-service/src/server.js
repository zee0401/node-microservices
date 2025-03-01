import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

import logger from "./utils/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import { connectDb } from "./config/connectDb.js";
import mediaRoutes from "./routes/media-route.js";

dotenv.config();
const PORT = process.env.PORT || 3004;

connectDb();

const app = express();
app.use(express.json());

app.use(cors());
app.use(helmet());

app.use((req, res, next) => {
    logger.info(`Request ${req.method} requested to ${req.url}`);
    logger.info(`Request Body ${req.body}`);
    next();
});

app.use("/api/media", mediaRoutes);

app.use(errorHandler);

async function startServer() {
    try {
        app.listen(PORT, () => {
            logger.info(`Post service running on port ${PORT}`);
        });
    } catch (error) {
        logger.error("Failed to connect to server", error);
        process.exit(1);
    }
}

startServer();

process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at", promise, "reason:", reason);
});
