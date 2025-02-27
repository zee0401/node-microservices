import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
    {
        publicId: {
            type: String,
            required: true,
        },
        originalName: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        mimeType: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Media", mediaSchema);
