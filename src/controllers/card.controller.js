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
    // 🔍 Tìm cả 2 column
    const [fromCol, toCol] = await Promise.all([
      Column.findById(fromColumnId),
      Column.findById(toColumnId),
    ]);

    if (!fromCol || !toCol) {
      return res.status(404).json({ message: "Column not found" });
    }

    // 🧩 Tìm card trong fromCol
    const cardIndex = fromCol.cards.findIndex(
      (c) => c._id.toString() === cardId
    );
    if (cardIndex === -1) {
      return res
        .status(404)
        .json({ message: "Card not found in source column" });
    }

    // ✂️ Bỏ card khỏi cột gốc
    const [card] = fromCol.cards.splice(cardIndex, 1);
    await fromCol.save();

    // 🔄 Clone card để tránh lỗi duplicate _id khi push sang toCol
    const newCard = {
      ...card.toObject(),
      _id: new mongoose.Types.ObjectId(), // tạo id mới
    };

    // 📥 Thêm vào cột đích theo vị trí
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
