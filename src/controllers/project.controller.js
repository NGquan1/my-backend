import Project from "../models/project.model.js";
import Column from "../models/column.model.js";
import Note from "../models/note.model.js";
import crypto from "crypto";
import { SharedLink } from "../models/sharedLink.model.js";

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = new Project({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id],
    });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const project = await Project.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      { name },
      { new: true }
    );
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid project ID format" });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if the user is the owner of the project
    if (!project.owner.equals(req.user._id)) {
      return res
        .status(403)
        .json({ error: "Only project owner can delete the project" });
    }

    await Project.findByIdAndDelete(id);
    await Column.deleteMany({ project: id });
    await Note.deleteMany({ project: id });

    res.json({ message: "Project and all related data deleted" });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(400).json({ error: err.message });
  }
};

export const createShareLink = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { role } = req.body;

    if (!["editor", "viewer"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (!project.owner.equals(req.user._id)) {
      return res
        .status(403)
        .json({ error: "You are not the owner of this project" });
    }

    const token = crypto.randomBytes(24).toString("hex");

    const link = new SharedLink({
      token,
      projectId,
      role,
    });

    await link.save();
    res.status(201).json({ token });
  } catch (err) {
    console.error("Error creating share link:", err);
    res.status(500).json({ error: "Failed to create share link" });
  }
};

export const joinProjectByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user._id;

    const link = await SharedLink.findOne({ token });
    if (!link)
      return res.status(404).json({ error: "Invalid or expired token" });

    const project = await Project.findById(link.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const isAlreadyMember = project.members.some((m) => m.equals(userId));
    if (!isAlreadyMember) {
      project.members.push(userId);
      await project.save();
    }

    res.status(200).json({
      message: "Joined project successfully",
      projectId: project._id,
      role: link.role,
    });
  } catch (err) {
    console.error("Join project error:", err);
    res.status(500).json({ error: "Failed to join project" });
  }
};
