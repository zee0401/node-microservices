import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import Redis from "ioredis";

import logger from "./utils/logger.js";
import postRoute from "./routes/postRoute.js";
import errorHandler from "./middleware/errorHandler.js";
import connectDb from "./connectDb/connectDb.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3002;

connectDb();

const redisClient = new Redis(process.env.REDIS_URL);

app.use(express.json());
app.use(helmet());
app.use(cors());

app.use((req, res, next) => {
    logger.info(`request for ${req.method} request to ${req.url}`);
    logger.info(`request body ${JSON.stringify(req.body)}`);
    next();
});

//implement ip based rate limiting for sensitive routes

app.use(
    "/api/posts",
    (req, res, next) => {
        req.redisClient = redisClient;
        next();
    },
    postRoute
);

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
