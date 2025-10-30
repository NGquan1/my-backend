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
    console.warn("[API][moveCard] missing column IDs");
    return res.status(400).json({ message: "Missing column IDs" });
  }

  try {
    const fromCol = await Column.findById(fromColumnId);
    const toCol = await Column.findById(toColumnId);

    console.log("[API][moveCard] found columns:", {
      fromColExists: !!fromCol,
      toColExists: !!toCol,
      fromColCardsBefore: fromCol
        ? fromCol.cards.map((c) => c._id.toString())
        : null,
      toColCardsBefore: toCol ? toCol.cards.map((c) => c._id.toString()) : null,
    });

    if (!fromCol || !toCol) {
      console.warn("[API][moveCard] column not found");
      return res.status(404).json({ message: "Column not found" });
    }

    const cardIndex = fromCol.cards.findIndex(
      (c) => c._id.toString() === cardId
    );
    if (cardIndex === -1) {
      console.warn("[API][moveCard] card not found in source column", {
        cardId,
      });
      return res
        .status(404)
        .json({ message: "Card not found in source column" });
    }

    // Remove card from source
    const [card] = fromCol.cards.splice(cardIndex, 1);
    await fromCol.save();

    // Insert to target at specified index (clamp index)
    const insertIndex =
      typeof toCardIndex === "number" && toCardIndex >= 0
        ? Math.min(toCardIndex, toCol.cards.length)
        : toCol.cards.length;

    toCol.cards.splice(insertIndex, 0, card);
    await toCol.save();

    console.log("[API][moveCard] moved card successfully. After state:", {
      fromColCardsAfter: fromCol.cards.map((c) => c._id.toString()),
      toColCardsAfter: toCol.cards.map((c) => c._id.toString()),
      insertIndex,
    });

    return res.status(200).json({ message: "Card moved successfully", card });
  } catch (err) {
    console.error("[API][moveCard] Move card failed:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};
