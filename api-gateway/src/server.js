import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import redis from "ioredis";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";

import logger from "../../identity-service/src/utils/logger.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

const redisClient = new redis(process.env.REDIS_URL);

app.use(express.json());
app.use(cors());
app.use(helmet());

const ratelimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(
            "sensitive endpoints rate limit exceeded for IP address",
            req.ip
        );
        res.status(429).json({
            success: false,
            message: "Too many requests",
        });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
});

app.use(ratelimit);

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request from ${req.ip} for ${req.url}`);
    logger.info(`request body: ${req.body}`);
    next();
});
