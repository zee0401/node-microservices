import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import proxy from "express-http-proxy";

import logger from "../src/utils/logger.js";
import errorHandler from "./middleware/errorHandler.js";
import { validateToken } from "./middleware/authMiddleware.js";
import proxyOptions from "./utils/proxyOptions.js";
import ratelimitOptions from "./middleware/rateLimitOptions.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use(ratelimitOptions);

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request from ${req.ip} for ${req.url}`);
    logger.info(`request body: ${req.body}`);
    next();
});

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

app.use(
    "/v1/media",
    validateToken,
    proxy(process.env.MEDIA_SERVICE_URL, {
        ...proxyOptions,
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            proxyReqOpts.headers["x-user-id"] = srcReq.user?.userId;

            const contentType = srcReq.headers["content-type"]?.toLowerCase();
            logger.info(`Incoming Content-Type: ${contentType}`);

            if (
                !srcReq.headers["content-type"].startsWith(
                    "multipart/form-data"
                )
            ) {
                proxyReqOpts.headers["Content-Type"] = "application/json";
            }

            return proxyReqOpts;
        },
        userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
            logger.info(
                `Proxy received from media service: ${userRes.statusCode}`
            );
            return proxyResData;
        },
        parseReqBody: false, // ✅ Must be `false` to allow file uploads
    })
);

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Server started on port is ${PORT}`);
    logger.info(`Identity Service URL: ${process.env.IDENTITY_SERVICE_URL}`);
    logger.info(`Post Service URL: ${process.env.POST_SERVICE_URL}`);
    logger.info(`Media Service URL: ${process.env.MEDIA_SERVICE_URL}`);
    logger.info(`Redis URL: ${process.env.REDIS_URL}`);
});
