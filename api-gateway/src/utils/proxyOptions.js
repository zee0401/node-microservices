import logger from "../utils/logger.js";
const proxyOptions = {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace(/^\/v1/, "/api");
    },
    proxyErrorHandler: (err, res, next) => {
        logger.error("proxy error", err);
        res.status(500).json({
            success: false,
            message: `Internal server error : `,
            error: err.message,
        });
    },
};

export default proxyOptions;
