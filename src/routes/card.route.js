import express from "express";
import { moveCard } from "../controllers/card.controller.js";

const router = express.Router();

router.patch("/:cardId/move", moveCard);

export default router;
