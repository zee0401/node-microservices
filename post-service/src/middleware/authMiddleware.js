import logger from "../utils/logger";

const authMiddleware = (req, res, next) => {
    const userId = req.headers["x-user-id"];
    logger.info("Authentication", req.headers);
    if (!userId) {
        logger.error("Access denied without user id");
        return res.status(401).json({
            success: false,
            message: "Authencation required! Please login to continue",
        });
    }
    req.user = { userId };
    next();
};

export default authMiddleware;
