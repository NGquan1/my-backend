import { Server } from "socket.io";
import Message from "../models/message.model.js";

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ["https://noty-mocha.vercel.app", "http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  console.log("🚀 [Socket.IO] Initialized and waiting for connections...");

  io.engine.on("connection_error", (err) => {
    console.error("❌ [Engine Error] code:", err.code);
    console.error("message:", err.message);
    console.error("context:", err.context);
  });

  io.on("connection", (socket) => {
    console.log(`✅ [Socket.IO] User connected: ${socket.id}`);
    console.log("🌍 Origin:", socket.handshake.headers.origin);
    console.log("📡 Transport:", socket.conn.transport.name);

    socket.on("join_project", (projectId) => {
      socket.join(projectId);
      console.log(
        `📂 [Socket.IO] ${socket.id} joined project room: ${projectId}`
      );
    });

    socket.on("send_message", async (data) => {
      console.log("📨 [Socket.IO] Received send_message event:", data);
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

        console.log("✅ [Socket.IO] Message saved and broadcasting...");
        socket.to(data.projectId).emit("receive_message", savedMessage);
      } catch (error) {
        console.error("❌ [Socket.IO] Error saving message:", error);
      }
    });

    socket.on("disconnect", (reason) => {
      console.warn(
        `⚠️ [Socket.IO] User disconnected: ${socket.id}, reason: ${reason}`
      );
    });
  });

  return io;
};
