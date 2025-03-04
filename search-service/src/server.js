import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import redis from "ioredis";

import logger from "./utils/logger.js";
import errorHandler from "./middlewares/errorHandler.js";
import { consumeEvent, connectToRabbitMQ } from "./utils/rabbitmq.js";
import searchRoute from "./routes/search-route.js";
import connectDb from "./config/connectdb.js";

dotenv.config();

const PORT = process.env.PORT || 3005;

const app = express();
connectDb();

const redisClient = redis.createClient(process.env.REDIS_URL);

redisClient.on("error", (err) => {
    logger.error("Redis Error", err);
});

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
});

app.use("/api/search", searchRoute);

app.use(errorHandler);

const startServer = async () => {
    try {
        await connectToRabbitMQ();

        app.listen(PORT, () => {
            logger.info(`Server started on port is ${PORT}`);
            logger.info(
                `Search Service URL: ${process.env.SEARCH_SERVICE_URL}`
            );
            logger.info(`Redis URL: ${process.env.REDIS_URL}`);
        });
    } catch (error) {
        logger.error("Error starting server", error);
        process.exit(1);
    }
};

startServer();
