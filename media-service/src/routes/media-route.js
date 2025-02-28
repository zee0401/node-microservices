import express from "express";
import { uploadMedia } from "../controllers/media-controller.js";
import logger from "../utils/logger.js";
import multer from "multer";
import authenticateRequest from "../middleware/authMiddleware.js";

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 5,
    },
}).single("file");

router.post(
    "/upload",
    authenticateRequest,
    (req, res, next) => {
        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                logger.error("Multer error while uploading:", err);
                return res.status(400).json({
                    message: "Multer error while uploading:",
                    error: err.message,
                    stack: err.stack,
                });
            } else if (err) {
                logger.error("Unknown error occured while uploading:", err);
                return res.status(500).json({
                    message: "Unknown error occured while uploading:",
                    error: err.message,
                    stack: err.stack,
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    message: "No file found!",
                });
            }

            next();
        });
    },
    uploadMedia
);

export default router;
