import { Server } from "socket.io";
import Message from "../models/message.model.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", "https://noty-mocha.vercel.app"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token && socket.handshake.headers.cookie) {
        const cookieHeader = socket.handshake.headers.cookie;
        const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
          const [name, value] = cookie.trim().split("=");
          acc[name] = value;
          return acc;
        }, {});

        token = cookies.jwt;
      }

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        console.error("❌ User not found in database:", decoded.id);
        return next(new Error("Authentication error: User not found"));
      }

      socket.userId = decoded.id;
      socket.username = user.fullName;
      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token - " + error.message));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `User connected via WebSocket: ${socket.id}, User ID: ${socket.userId}, Username: ${socket.username}`
    );

    socket.on("join-project", (projectId) => {
      socket.join(`project-${projectId}`);
      socket.projectId = projectId;

      socket.to(`project-${projectId}`).emit("user-joined", {
        userId: socket.userId,
        username: socket.username,
        color: generateUserColor(socket.userId),
      });
    });

    socket.on("join_project", (projectId) => {
      socket.join(projectId);
    });

    socket.on("cursor-move", ({ projectId, position, elementId }) => {
      socket.to(`project-${projectId}`).emit("remote-cursor-move", {
        userId: socket.userId,
        position,
        elementId,
        timestamp: Date.now(),
      });
    });

    socket.on("leave-project", (projectId) => {
      socket.leave(`project-${projectId}`);
      socket.to(`project-${projectId}`).emit("user-left", {
        userId: socket.userId,
      });
    });

    socket.on("send_message", async (data) => {
      try {
        const newMessage = new Message({
          text: data.text,
          sender: data.senderId,
          project: data.projectId,
        });

        let savedMessage = await newMessage.save();

        savedMessage = await savedMessage.populate(
          "sender",
          "fullName profilePic"
        );

        socket.to(data.projectId).emit("receive_message", savedMessage);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}, User ID: ${socket.userId}`);
      if (socket.projectId) {
        socket.to(`project-${socket.projectId}`).emit("user-left", {
          userId: socket.userId,
        });
      }
    });
  });

  console.log("Socket.IO initialized successfully!");
  return io;
};

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
