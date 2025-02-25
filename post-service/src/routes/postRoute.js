import express from "express";
import {
    createPost,
    deletePostById,
    getAllPosts,
    getPostById,
} from "../controllers/postController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.post("/create-post", createPost);
router.get("/all-post", getAllPosts);
router.post("/:id", getPostById);
router.delete("/:id", deletePostById);

export default router;
