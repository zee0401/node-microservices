import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import helmet from "helmet";

import logger from "./logger";
import errorHandler from "./errorHandler";
import { connectDb } from "./config/connectDb";

dotenv.config();

connectDb();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

app.use((req, res, next) => {
    logger.info(`Request ${req.method} requested to &{req.url}`);
    logger.info(`Request Body ${req.body}`);
    next();
});
app.use("/media", mediaRoutes);
