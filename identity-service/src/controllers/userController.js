import User from "../models/UserModel.js";
import { registerValidation } from "../utils/validation.js";
import logger from "../utils/logger.js";
import generateToken from "../utils/generateToken.js";

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
