import logger from "../utils/logger.js";

const authenticateRequest = async (req, res, next) => {
    const userId = await req.headers["x-user-id"];

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    req.user = { userId };
    next();
};

export default authenticateRequest;
