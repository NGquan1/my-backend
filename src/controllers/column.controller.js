import Column from "../models/column.model.js";
import Project from "../models/project.model.js";

export const createColumn = async (req, res) => {
  try {
    const { title, projectId } = req.body;
    if (!projectId) return res.status(400).json({ error: "Missing projectId" });
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });
    const isMember =
      project.owner.equals(req.user._id) ||
      project.members.some((m) => m.equals(req.user._id));
    if (!isMember) return res.status(403).json({ error: "No permission" });
    const column = await Column.create({
      title,
      user: req.user._id,
      project: projectId,
      cards: [],
    });
    res.status(201).json(column);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getColumns = async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = {};
    if (projectId) filter.project = projectId;
    const columns = await Column.find(filter);
    const User = (await import("../models/user.model.js")).default;
    for (const col of columns) {
      for (const card of col.cards) {
        if (card.user) {
          const user = await User.findById(card.user).select(
            "fullName email profilePic"
          );
          card.user = user
            ? {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
              }
            : null;
        }
      }
    }
    res.status(200).json(columns);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateColumn = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const column = await Column.findById(id);
    if (!column) return res.status(404).json({ error: "Column not found" });
    const project = await Project.findById(column.project);
    if (!project) return res.status(404).json({ error: "Project not found" });
    const isMember =
      project.owner.equals(req.user._id) ||
      project.members.some((m) => m.equals(req.user._id));
    if (!isMember) return res.status(403).json({ error: "No permission" });
    column.title = title;
    await column.save();
    res.status(200).json(column);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteColumn = async (req, res) => {
  try {
    const { id } = req.params;
    const column = await Column.findById(id);
    if (!column) return res.status(404).json({ error: "Column not found" });
    const project = await Project.findById(column.project);
    if (!project) return res.status(404).json({ error: "Project not found" });
    const isMember =
      project.owner.equals(req.user._id) ||
      project.members.some((m) => m.equals(req.user._id));
    if (!isMember) return res.status(403).json({ error: "No permission" });
    await column.deleteOne();
    res.status(200).json({ message: "Column deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const addCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { member, tasks, status } = req.body;
    const column = await Column.findById(id);
    if (!column) return res.status(404).json({ error: "Column not found" });
    const project = await Project.findById(column.project);
    if (!project) return res.status(404).json({ error: "Project not found" });
    const isMember =
      project.owner.equals(req.user._id) ||
      project.members.some((m) => m.equals(req.user._id));
    if (!isMember) return res.status(403).json({ error: "No permission" });
    column.cards.push({ member, tasks, status, user: req.user._id });
    await column.save();
    res.status(200).json(column);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateCard = async (req, res) => {
  try {
    const { id, cardId } = req.params;
    const { member, tasks, status } = req.body;
    const column = await Column.findById(id);
    if (!column) return res.status(404).json({ error: "Column not found" });
    const project = await Project.findById(column.project);
    if (!project) return res.status(404).json({ error: "Project not found" });
    const isMember =
      project.owner.equals(req.user._id) ||
      project.members.some((m) => m.equals(req.user._id));
    if (!isMember) return res.status(403).json({ error: "No permission" });
    const card = column.cards.id(cardId);
    if (!card) return res.status(404).json({ error: "Card not found" });
    card.member = member;
    card.tasks = tasks;
    card.status = status;
    await column.save();
    res.status(200).json(column);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const { id, cardId } = req.params;
    const column = await Column.findById(id);
    if (!column) return res.status(404).json({ error: "Column not found" });
    const project = await Project.findById(column.project);
    if (!project) return res.status(404).json({ error: "Project not found" });
    const isMember =
      project.owner.equals(req.user._id) ||
      project.members.some((m) => m.equals(req.user._id));
    if (!isMember) return res.status(403).json({ error: "No permission" });
    column.cards = column.cards.filter(
      (card) => card._id.toString() !== cardId
    );
    await column.save();
    res.status(200).json(column);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
