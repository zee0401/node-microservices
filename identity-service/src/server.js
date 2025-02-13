import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import Redis from "ioredis";
import { RateLimiterRedis } from "rate-limiter-flexible";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";

import connectDb from "./db/connectDb.js";
import userRoutes from "./routes/userRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import logger from "./utils/logger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

const sensitiveEnpointsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.error(
            "Sensitive endpoints rate limit exceeded for IP address",
            req.ip
        );
        res.status(429).json({
            success: false,
            message:
                "Sensitive endpoints rate limit exceeded Too many requests",
        });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
});

app.use("/api/auth/register", sensitiveEnpointsLimiter);

app.use("/api/auth", userRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Identity Server is running on port ${PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error("unhandledRejection", promise, "reason", reason);
});
