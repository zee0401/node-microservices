import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import Redis from "ioredis";
import { RateLimiterRedis } from "rate-limiter-flexible";

import connectDb from "./db/connectDb";
import userRoutes from "./routes/userRoutes";
import logger from "./utils/logger";

dotenv.config();

const app = express();

// connect to db
connectDb();

// redis
const redisClient = new Redis(process.env.REDIS_URL);

// middleware
app.use(cors());
app.use(express.json());
app.use(helmet());

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request from ${req.ip} for ${req.url}`);
    logger.info(`request body: ${req.body}`);
    next();
});

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "middleware",
    points: 10,
    duration: 1,
});

app.use((req, res, next) => {
    rateLimiter
        .consume(req.ip)
        .then(() => next())
        .catch(() => {
            logger.error("Too many requests");
            res.status(429).json({
                success: false,
                message: "Too many requests",
            });
        });
});

app.use("/user", userRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
