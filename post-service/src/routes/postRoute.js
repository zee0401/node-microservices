import express from "express";
import { createPost } from "../controllers/postController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.use(authMiddleware);
router.post("/create-post", createPost);

export default router;
