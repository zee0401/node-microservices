import Post from "../models/postModel";
import logger from "../utils/logger";

export const createPost = async (req, res) => {
    logger.info("Creating post endpoint");
    try {
        const { content, mediaIds } = req.body;
        const post = await Post.create({
            user: req.user.user._id,
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
