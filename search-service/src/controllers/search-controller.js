import logger from "../utils/logger.js";
import Search from "../models/search-models.js";

export const searchController = async (req, res) => {
    logger.info("Search Controller ");
    try {
        const { query } = req.query;

        const result = await Search.find(
            {
                $text: { $search: query },
            },
            {
                score: { $meta: "textScore" },
            }
        )
            .sort({ score: { $meta: "textScore" } })
            .limit(10);

        res.status(200).json(result);
    } catch (error) {
        logger.error("Error in Search Controller", error);
        res.status(500).json({
            success: false,
            message: "Search Error",
        });
    }
};
