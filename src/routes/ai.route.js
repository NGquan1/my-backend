import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { aiGenerateProject } from "../controllers/ai.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/generate-project", aiGenerateProject);

export default router;
