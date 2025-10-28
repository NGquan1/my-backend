import Calendar from "../models/calendar.model.js";

export const getEvents = async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = {};
    if (projectId) filter.project = projectId;

    const events = await Calendar.find(filter).populate(
      "user",
      "fullName email profilePic"
    );
    res.status(200).json(events);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    if (!req.body.project) {
      return res.status(400).json({ error: "Missing project id" });
    }
    const event = await Calendar.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Calendar.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.status(200).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Calendar.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });
    if (!deleted) return res.status(404).json({ error: "Event not found" });
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
