import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  createShareLink,
  joinProjectByToken,
} from "../controllers/project.controller.js";
import {
  getProjectMembers,
  removeProjectMember,
} from "../controllers/projectMembers.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getProjects);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

router.get("/:id/members", getProjectMembers);
router.delete("/:id/members/:userId", removeProjectMember);
router.post("/:id/share", createShareLink);
router.post("/join/:token", joinProjectByToken);

export default router;
