import express from "express";
import { Server } from "socket.io";
const router = express.Router();

router.get("/projects/:projectId/presence", async (req, res) => {
  try {
    const { projectId } = req.params;
    const io = req.app.get("socketio");
    const projectRoom = io.sockets.adapter.rooms.get(`project-${projectId}`);
    const activeUsers = [];

    if (projectRoom) {
      for (const socketId of projectRoom) {
        const socket = io.sockets.sockets.get(socketId);
        if (socket && socket.userId) {
          activeUsers.push({
            userId: socket.userId,
            username: socket.username,
            color: generateUserColor(socket.userId),
            lastSeen: socket.lastActivity || Date.now(),
          });
        }
      }
    }

    res.json({ users: activeUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const generateUserColor = (userId) => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
  ];

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

export default router;
