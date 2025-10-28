import mongoose from "mongoose";
import Note from "../models/note.model.js";

export const createNote = async (req, res) => {
  try {
    const { title, content, projectId } = req.body;
    if (!title || !projectId) {
      return res
        .status(400)
        .json({ error: "Title and projectId are required." });
    }
    const note = await Note.create({
      title,
      content: content && content.trim() !== "" ? content : " ",
      user: req.user._id,
      projectId: new mongoose.Types.ObjectId(projectId),
    });
    res.status(201).json(note);
  } catch (error) {
    console.error("Create note error:", error);
    res.status(400).json({ error: error.message, stack: error.stack });
  }
};

export const getNotes = async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = {};
    if (projectId) filter.projectId = projectId;
    const notes = await Note.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "fullName email profilePic");
    res.status(200).json(notes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, projectId } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { title, content, projectId },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.status(200).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findOneAndDelete({ _id: id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
