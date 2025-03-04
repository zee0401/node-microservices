import express from "express";
import { searchController } from "../controllers/search-controller.js";
import authMiddleware from "../middlewares/authmiddleware.js";

const router = express.Router();

router.get("/posts", authMiddleware, searchController);

export default router;
