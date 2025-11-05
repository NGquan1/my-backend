import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createColumn,
  getColumns,
  updateColumn,
  deleteColumn,
  addCard,
  updateCard,
  deleteCard,
} from "../controllers/column.controller.js";
import { reorderCards } from "../controllers/card.controller.js";

const router = express.Router();

router.use(protectRoute);
router.get("/", getColumns);
router.post("/", createColumn);
router.put("/:id", updateColumn);
router.delete("/:id", deleteColumn);

router.post("/:id/cards", addCard);
router.put("/:id/cards/:cardId", updateCard);
router.delete("/:id/cards/:cardId", deleteCard);
router.patch("/:columnId/cards/reorder", reorderCards);

export default router;
