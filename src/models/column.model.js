import mongoose from "mongoose";
import { cardSchema } from "./card.model.js";

const columnSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    cards: [cardSchema],
  },
  { timestamps: true }
);

const Column = mongoose.model("Column", columnSchema);
export default Column;
