import Post from "../models/postModel.js";
import logger from "../utils/logger.js";
import { validateCreatePost } from "../utils/validation.js";

export const createPost = async (req, res) => {
    logger.info("Creating post endpoint");

    try {
        const { error } = validateCreatePost(req.body);

        if (error) {
            logger.error("Validation Error", error);
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const { content, mediaIds } = req.body;
        const post = await Post.create({
            user: req.user.userId,
            content,
            mediaIds: mediaIds || [],
        });

        await post.save();

        logger.info("Post Created Successfully");
        res.status(201).json({
            success: true,
            message: "Post Created Successfully",
        });
    } catch (err) {
        logger.error("Error Creating Post", err);
        res.status(500).json({
            success: false,
            message: "Error Creating Post",
        });
    }
};
