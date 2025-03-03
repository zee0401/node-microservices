import logger from "../utils/logger.js";
import Media from "../models/Media.js";
import { deleteUserFromCloudinary } from "../utils/cloudinary.js";

export const handleMediaDeleted = async (event) => {
    logger.info("Handling Media Deleted Event");

    const { mediaId, postId } = event;
    try {
        const mediaIdtoDelete = await Media.find({ _id: { $in: mediaId } });

        for (const media of mediaIdtoDelete) {
            await deleteUserFromCloudinary(media.publicId);
            await Media.findByIdAndDelete(media._id);
            logger.info(
                `Deleted media ${media._id} assosiated with post ${postId}`
            );
        }
    } catch (error) {
        logger.error("Error Handling Media Deleted Event", error);
    }
};
