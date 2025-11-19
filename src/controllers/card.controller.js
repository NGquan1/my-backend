import mongoose from "mongoose";
import Column from "../models/column.model.js";

export const moveCard = async (req, res) => {
  const { cardId } = req.params;
  const { fromColumnId, toColumnId, toCardIndex } = req.body;

  console.log("[API][moveCard] incoming:", {
    cardId,
    fromColumnId,
    toColumnId,
    toCardIndex,
  });

  if (!fromColumnId || !toColumnId) {
    return res.status(400).json({ message: "Missing column IDs" });
  }

  try {
    const [fromCol, toCol] = await Promise.all([
      Column.findById(fromColumnId),
      Column.findById(toColumnId),
    ]);

    if (!fromCol || !toCol) {
      return res.status(404).json({ message: "Column not found" });
    }

    const cardIndex = fromCol.cards.findIndex(
      (c) => c._id.toString() === cardId
    );
    if (cardIndex === -1) {
      return res
        .status(404)
        .json({ message: "Card not found in source column" });
    }

    const [card] = fromCol.cards.splice(cardIndex, 1);
    await fromCol.save();

    const newCard = {
      ...card.toObject(),
      _id: new mongoose.Types.ObjectId(),
    };

    const insertIndex =
      typeof toCardIndex === "number" && toCardIndex >= 0
        ? Math.min(toCardIndex, toCol.cards.length)
        : toCol.cards.length;

    toCol.cards.splice(insertIndex, 0, newCard);
    await toCol.save();

    console.log("[API][moveCard] ✅ Card moved successfully", {
      fromColCardsAfter: fromCol.cards.map((c) => c._id.toString()),
      toColCardsAfter: toCol.cards.map((c) => c._id.toString()),
    });

    return res.status(200).json({
      message: "Card moved successfully",
      card: newCard,
      toColumnId,
    });
  } catch (err) {
    console.error("[API][moveCard] ❌ Error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

export const reorderCards = async (req, res) => {
  try {
    const { columnId } = req.params;
    const { fromIndex, toIndex } = req.body;
    const column = await Column.findById(columnId);
    if (!column) return res.status(404).json({ error: "Column not found" });

    const [card] = column.cards.splice(fromIndex, 1);
    column.cards.splice(toIndex, 0, card);
    await column.save();

    res.json({ message: "Cards reordered successfully", cards: column.cards });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
