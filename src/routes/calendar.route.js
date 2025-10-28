import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/calendar.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getEvents);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;
