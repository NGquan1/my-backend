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
    path: "/socket.io/",
  });

  console.log("🚀 [Socket] Initialized. Waiting for connections...");

  io.engine.on("connection_error", (err) => {
    console.error("❌ [Socket.IO Engine Error]");
    console.error("Code:", err.code);
    console.error("Message:", err.message);
    console.error("Context:", err.context);
  });

  io.on("connection", (socket) => {
    console.log(`✅ [Socket] Connected: ${socket.id}`);
    console.log("Handshake headers:", socket.handshake.headers.origin);
    console.log("Transport:", socket.conn.transport.name);

    socket.on("join_project", (projectId) => {
      socket.join(projectId);
      console.log(`📂 [Socket] ${socket.id} joined project room: ${projectId}`);
    });

    socket.on("send_message", async (data) => {
      console.log(`📨 [Socket] send_message from ${data.senderId}`);
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
        console.error("❌ [Socket] Error saving message:", error);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ [Socket] Disconnected: ${socket.id}`);
      console.log("Reason:", reason);
    });
  });

  return io;
};
