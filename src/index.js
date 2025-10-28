import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http"; 

import { initializeSocket } from "./lib/socket.js"; 

import { connectDB } from "./lib/db.js";

import authRouter from "./routes/auth.route.js";
import noteRouter from "./routes/note.route.js";
import columnRouter from "./routes/column.route.js";
import projectRouter from "./routes/project.route.js";
import calendarRouter from "./routes/calendar.route.js";
import cardRoutes from "./routes/card.route.js";
import aiRouter from "./routes/ai.route.js";
import messageRouter from "./routes/message.route.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5001; 

const httpServer = http.createServer(app);

const io = initializeSocket(httpServer); 
app.set('socketio', io); 

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRouter);
app.use("/api/notes", noteRouter);
app.use("/api/cards", cardRoutes);
app.use("/api/columns", columnRouter);
app.use("/api/projects", projectRouter);
app.use("/api/events", calendarRouter);
app.use("/api/calendar", calendarRouter);
app.use("/api/messages", messageRouter);
app.use("/api/ai", aiRouter);
app.get('/api/test', (req, res) => res.json({ ok: true }));


httpServer.listen(PORT, () => {
  console.log("Server is running on PORT:" + PORT);
  connectDB();
});