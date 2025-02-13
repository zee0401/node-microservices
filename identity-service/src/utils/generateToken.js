import jwt from "jsonwebtoken";
import RefreshToken from "../models/refreshTokenModel.js";
import crypto from "crypto";

const generateToken = async (user) => {
    const accessToken = jwt.sign(
        { user: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "60m" }
    );

    const refreshToken = crypto.randomBytes(40).toString("hex");

    const expiresAt = new Date();

    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
        token: refreshToken,
        user: user._id,
        expiresAt,
    });

    return { accessToken, refreshToken };
};

export default generateToken;
