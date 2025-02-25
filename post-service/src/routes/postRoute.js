import express from "express";
import { createPost, getAllPosts } from "../controllers/postController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.post("/create-post", createPost);
router.get("/all-post", getAllPosts);

export default router;
