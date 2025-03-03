import Post from "../models/postModel.js";
import logger from "../utils/logger.js";

import { validateCreatePost } from "../utils/validation.js";
import { invalidateCache } from "../utils/invalidateCache.js";
import { publishEventToRabbitMQ } from "../utils/rabbitmq.js";

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
        await invalidateCache(req, post._id.toString());

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
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts,
            currentPage: page,
        };

        await req.redisClient.setex(cachedKey, 300, JSON.stringify(result));

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

export const getPostById = async (req, res) => {
    logger.info("Getting post by id endpoint");

    try {
        const post = req.params.id;

        const cachedKey = `post:${post}`;

        const cachedPost = await req.redisClient.get(cachedKey);

        if (cachedPost) {
            return res.status(200).json({
                success: true,
                message: "Post Found",
                post: JSON.parse(cachedPost),
            });
        }

        const singlePost = await Post.findById(post);

        if (!singlePost) {
            return res.status(404).json({
                success: false,
                message: "Post Not Found",
            });
        }

        await req.redisClient.setex(
            cachedKey,
            3000,
            JSON.stringify(singlePost)
        );

        res.status(200).json({
            success: true,
            message: "Post Found",
            singlePost,
        });
    } catch (err) {
        logger.error("Error fetching the post", err);
        res.status(500).json({
            success: false,
            message: "Error fetching the  post",
        });
    }
};

export const deletePostById = async (req, res) => {
    logger.info("Deleting post by id endpoint");

    try {
        const postId = req.params.id;
        const post = await Post.findByIdAndDelete({
            _id: postId,
            user: req.user.userId,
        });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post Not Found",
            });
        }

        await publishEventToRabbitMQ("post-deleted", {
            postId: post._id.toString(),
            user: req.user.userId,
            mediaIds: post.mediaIds,
        });

        await invalidateCache(req, postId);

        logger.info("Post Deleted Successfully");
        res.status(200).json({
            success: true,
            message: "Post Deleted Successfully",
        });
    } catch (err) {
        logger.error("Error deleting post", err);
        res.status(500).json({
            success: false,
            message: "Error deleting post",
        });
    }
};
