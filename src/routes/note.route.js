import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
} from "../controllers/note.controller.js";

const router = express.Router();

router.use(protectRoute);
router.get("/", getNotes);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;
