import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.Schema.types.ObjectId,
            ref: "User",
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
