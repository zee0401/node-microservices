import { v2 as cloudinary } from "cloudinary";
import logger from "./logger.js";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadMediaToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "auto",
            },

            (error, result) => {
                if (error) {
                    logger.error("Error while uploading image", error);
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        uploadStream.end(file.buffer);
    });
};
