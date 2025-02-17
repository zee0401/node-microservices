import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({
        success: false,
        message: `Internal server error : `,
        error: err.message,
    });
};

export default errorHandler;
