import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  member: { type: String, required: true },
  tasks: [{ type: String, required: true }],
  status: {
    type: String,
    enum: [
      "to-do",
      "ongoing",
      "finished",
      "urgent",
      "important",
      "normal",
      "low",
    ],
    default: "to-do",
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Card = mongoose.model("Card", cardSchema);

export { cardSchema };
export default Card;
