import mongoose from "mongoose";
import argon2 from "argon2";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        try {
            this.password = await argon2.hash(this.password);
        } catch (err) {
            return next(err);
        }
    }
});

userSchema.methods.comparePassword = async function (password) {
    try {
        return await argon2.verify(this.password, password);
    } catch (error) {
        throw error("Invalid password");
    }
};

userSchema.index({ username: "text" });

const User = mongoose.model("User", userSchema);

export default User;
