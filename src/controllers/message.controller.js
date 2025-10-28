import Message from "../models/message.model.js";

export const getMessages = async (req, res) => {
  const { projectId } = req.params;

  try {
    const messages = await Message.find({ project: projectId })
      .sort({ createdAt: "asc" })
      .populate("sender", "fullName profilePic");

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Can't find messages" });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Don't have permission to delete message" });
    }

    await Message.findByIdAndDelete(messageId);

    const io = req.app.get("socketio");
    io.to(message.project.toString()).emit("message_deleted", { messageId });

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Message deleted unsuccessfully" });
  }
};
