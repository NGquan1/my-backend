import express from "express";
import {
  getMessages,
  deleteMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:projectId", protectRoute, getMessages);
router.delete("/:messageId", protectRoute, deleteMessage);

export default router;
