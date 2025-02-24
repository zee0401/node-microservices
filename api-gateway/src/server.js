import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import redis from "ioredis";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import proxy from "express-http-proxy";

import logger from "../src/utils/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import { validateToken } from "./middleware/authMiddleware.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

const redisClient = new redis(process.env.REDIS_URL);

app.use(express.json());
app.use(cors());
app.use(helmet());

const ratelimitOptions = rateLimit({
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

app.use(ratelimitOptions);

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request from ${req.ip} for ${req.url}`);
    logger.info(`request body: ${req.body}`);
    next();
});

const proxyOptions = {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace(/^\/v1/, "/api");
    },
    proxyErrorHandler: (err, res, next) => {
        logger.error("proxy error", err);
        res.status(500).json({
            success: false,
            message: `Internal server error : `,
            error: err.message,
        });
    },
};

app.use(
    "/v1/auth",
    proxy(process.env.IDENTITY_SERVICE_URL, {
        ...proxyOptions,
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            proxyReqOpts.headers["Content-Type"] = "application/json";
            return proxyReqOpts;
        },
        userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
            logger.info(
                `proxy received from identity service ${userRes.statusCode}`
            );
            return proxyResData;
        },
    })
);

app.use(
    "/v1/posts",
    validateToken,
    proxy(process.env.POST_SERVICE_URL, {
        ...proxyOptions,
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            proxyReqOpts.headers["Content-Type"] = "application/json";
            proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
            return proxyReqOpts;
        },
        userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
            logger.info(
                `proxy received from post service ${userRes.statusCode}`
            );
            return proxyResData;
        },
    })
);

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Server started on port is ${PORT}`);
    logger.info(`Identity Service URL: ${process.env.IDENTITY_SERVICE_URL}`);
    logger.info(`Post Service URL: ${process.env.POST_SERVICE_URL}`);
    logger.info(`Redis URL: ${process.env.REDIS_URL}`);
});
