import logger from "../utils/logger.js";
import { uploadMediaToCloudinary } from "../utils/cloudinary.js";
import Media from "../models/Media.js";

export const uploadMedia = async (req, res) => {
    logger.info("Started uploading Media");
    try {
        const file = req.file;
        if (!file) {
            logger.error("No file uploaded");
            return res
                .status(400)
                .json({ message: "No file uploaded", success: false });
        }

        const { originalName, mimeType, buffer } = req.file;
        const userId = req.user.userId;

        logger.info(`file details ${originalName} ${mimeType} `);
        logger.info("Uploading media to cloudinary started");

        const cloudinaryMediaUpload = await uploadMediaToCloudinary(req.file);

        logger.info(
            "Uploading media to cloudinary completed",
            cloudinaryMediaUpload.public_id
        );

        const newlyCreatedMedia = new Media({
            publicId: cloudinaryMediaUpload.public_id,
            originalName,
            url: cloudinaryMediaUpload.secure_url,
            mimeType,
            userId: userId,
        });

        await newlyCreatedMedia.save();

        res.status(201).json({
            message: "Media uploaded successfully",
            success: true,
            mediaId: newlyCreatedMedia._id,
            url: newlyCreatedMedia.url,
        });
    } catch (error) {
        logger.error("Error while uploading media", error);
        return res.status(500).json({
            message: "Error while uploading  media",
            success: false,
        });
    }
};
