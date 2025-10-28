import Project from "../models/project.model.js";
import User from "../models/user.model.js";

export const getProjectMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).populate([
      { path: "owner", select: "_id fullName email profilePic" },
      { path: "members", select: "_id fullName email profilePic" },
    ]);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const allUsers = [
      { ...project.owner.toObject(), isOwner: true },
      ...project.members
        .filter((m) => m._id.toString() !== project.owner._id.toString())
        .map((m) => ({ ...m.toObject(), isOwner: false })),
    ];
    res.json(allUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeProjectMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only owner can remove members" });
    }
    if (userId === project.owner.toString()) {
      return res
        .status(400)
        .json({ error: "Cannot remove owner from project" });
    }
    project.members = project.members.filter((m) => m.toString() !== userId);
    await project.save();
    res.json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
