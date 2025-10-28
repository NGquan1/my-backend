import mongoose from "mongoose";

const SharedLinkSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  role: { type: String, enum: ["viewer", "editor"], required: true },
  expiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

SharedLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SharedLink = mongoose.model("SharedLink", SharedLinkSchema);
