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

export const getAllPosts = async (req, res) => {
    logger.info("Getting all posts endpoint");

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        const cachedKey = `posts:${page}:${limit}`;
        const cachedPosts = await req.redisClient.get(cachedKey);

        if (cachedPosts) {
            return res.status(200).json({
                success: true,
                message: "Posts Found",
                posts: JSON.parse(cachedPosts),
            });
        }

        const posts = await Post.find({})
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(startIndex);

        const totalPosts = await Post.countDocuments();

        const result = {
            posts,
            totalPages: Math.ceil(total / limit),
            totalPosts,
            currentPage: page,
        };

        await req.redisClient.set(cachedKey, 300, JSON.stringify(result));

        res.status(200).json({
            success: true,
            result,
        });
    } catch (err) {
        logger.error("Error fetching all posts", err);
        res.status(500).json({
            success: false,
            message: "Error fetching  posts",
        });
    }
};
