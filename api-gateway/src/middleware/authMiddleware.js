import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

export const validateToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    console.log(token, "token");

    if (!token) {
        logger.warn("unauthorized access");
        return res.status(401).json({
            success: false,
            message: "No token provided",
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            logger.warn("invalid token");
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }
        console.log(user, "user");
        req.user = user;
        next();
    });
};
