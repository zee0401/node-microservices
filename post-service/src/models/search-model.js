import mongoose from "mongoose";

const searchSchema = new mongoose.Schema(
    {
        postId: {
            type: String,
            required: true,
            unique: true,
        },
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        content: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

searchSchema.index({ content: "text" });
searchSchema.index({ createdAt: -1 });

export default mongoose.model("Search", searchSchema);
