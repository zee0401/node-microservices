import User from "../models/UserModel.js";
import { registerValidation, validateLogin } from "../utils/validation.js";
import logger from "../utils/logger.js";
import generateToken from "../utils/generateToken.js";
import RefreshToken from "../models/refreshTokenModel.js";

export const registerUser = async (req, res) => {
    logger.info("Registering user");

    try {
        const { error } = registerValidation(req.body);

        if (error) {
            logger.warn("validation error", error.details[0].message);
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }

        const { username, email, password } = req.body;

        let user = await User.findOne({ $or: [{ username }, { email }] });

        if (user) {
            logger.warn("user already exists");
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        user = await User.create({
            username,
            email,
            password,
        });

        await user.save();

        logger.warn("user created successfully");

        const { accessToken, refreshToken } = await generateToken(user);

        return res.status(200).json({
            success: true,
            message: "User registered successfully",
            data: {
                accessToken,
                refreshToken,
            },
        });
    } catch (err) {
        logger.error("Registeration failed", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const loginUser = async (req, res) => {
    logger.info("Login user Endpoint");

    const validation = validateLogin(req.body);
    if (validation.error) {
        logger.warn("validation error", validation.error.details[0].message);
        return res.status(400).json({
            success: false,
            message: validation.error.details[0].message,
        });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            logger.error("Invalid User");
            return res.status(400).json({
                success: false,
                message: "Invalid User credentials",
            });
        }

        const isPasswordMatched = await user.comparePassword(password);

        if (!isPasswordMatched) {
            logger.error("Invalid Password");
            return res.status(400).json({
                success: false,
                message: "Invalid User credentials",
            });
        }
        const { accessToken, refreshToken } = await generateToken(user);

        logger.info("user logged in successfully");

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: {
                accessToken,
                refreshToken,
                user: user._id,
            },
        });
    } catch (err) {
        logger.error("Login failed", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const refreshTokenUser = async (req, res) => {
    logger.info("Refresh token Endpoint");

    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            logger.error("Refresh token is required");
            return res.status(400).json({
                success: false,
                message: "Refresh token is required",
            });
        }

        const storedToken = await RefreshToken.findOne({ token: refreshToken });

        if (!storedToken || storedToken.expiresAt < new Date()) {
            logger.error(" token is invalid or expired");
            return res.status(400).json({
                success: false,
                message: "Refresh token is invalid",
            });
        }

        const user = await User.findById(storedToken.user);

        if (!user) {
            logger.error("User not found");
            return res.status(400).json({
                success: false,
                message: "User not found",
            });
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await generateToken(user);

        await RefreshToken.deleteOne({ _id: storedToken._id });

        logger.info("token refreshed successfully");

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (err) {
        logger.error("Refresh token error occurred", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
