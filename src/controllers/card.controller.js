import Column from "../models/column.model.js";

export const moveCard = async (req, res) => {
  const { cardId } = req.params;
  const { fromColumnId, toColumnId, toCardIndex } = req.body;

  if (!fromColumnId || !toColumnId)
    return res.status(400).json({ message: "Missing column IDs" });

  try {
    const fromCol = await Column.findById(fromColumnId);
    if (!fromCol)
      return res.status(404).json({ message: "From column not found" });

    const cardIndex = fromCol.cards.findIndex(
      (c) => c._id.toString() === cardId
    );
    if (cardIndex === -1)
      return res
        .status(404)
        .json({ message: "Card not found in source column" });

    // ✅ Lấy card ra
    const [card] = fromCol.cards.splice(cardIndex, 1);
    await fromCol.save();

    // ✅ Thêm card vào column mới đúng vị trí
    const toCol = await Column.findById(toColumnId);
    if (!toCol) return res.status(404).json({ message: "To column not found" });

    const insertIndex =
      typeof toCardIndex === "number" && toCardIndex >= 0
        ? Math.min(toCardIndex, toCol.cards.length)
        : toCol.cards.length;

    toCol.cards.splice(insertIndex, 0, card);
    await toCol.save();

    res.status(200).json({ message: "Card moved successfully", card });
  } catch (err) {
    console.error("Move card failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
