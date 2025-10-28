import { Server } from "socket.io";
import Message from "../models/message.model.js";

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected via WebSocket: ${socket.id}`);

    socket.on("join_project", (projectId) => {
      socket.join(projectId);
      console.log(`User ${socket.id} joined project room: ${projectId}`);
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
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  console.log("Socket.IO initialized successfully!");
  return io;
};
