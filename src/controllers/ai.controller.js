import Project from "../models/project.model.js";
import Column from "../models/column.model.js";
import Note from "../models/note.model.js";
import Calendar from "../models/calendar.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const aiGenerateProject = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { name, description, deadline, members, goals } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an AI project planner and task organizer.
Your job is to generate a clear, structured JSON project plan ONLY — no text outside JSON.

Project Info:
- Name: ${name}
- Description: ${description}
- Deadline: ${deadline}
- Members: ${members}
- Special Goals: ${goals}

Return strictly **valid JSON**, exactly like this (no markdown, no comments, no explanations):

{
  "cards": [
    {
      "title": "Research project goals",
      "member": "Member 1"
    },
    {
      "title": "Design system architecture",
      "member": "Member 2"
    },
    {
      "title": "Prepare presentation slides",
      "member": "Member 3"
    }
  ],
  "notes": [
    "Kickoff meeting scheduled for next week",
    "Ensure all members review requirements document"
  ],
  "events": [
    {
      "title": "Kickoff Meeting",
      "description": "Initial discussion about project goals and milestones",
      "startDate": "2025-10-15",
      "endDate": "2025-10-15",
      "location": "Google Meet"
    },
    {
      "title": "Final Review",
      "description": "Evaluate final deliverables before deadline",
      "startDate": "2025-10-28",
      "endDate": "2025-10-28",
      "location": "Main office"
    }
  ]
}

Rules:
- Each **card** represents ONE individual task.
- Each card must have a "title" and a "member" (assigned person).
- Distribute cards evenly among all members.
- If "Members" is a number, create placeholder names like "Member 1", "Member 2", etc.
- Notes summarize important ideas or reminders.
- Events represent project milestones or meetings.
- DO NOT include markdown formatting, code blocks, or any text outside the JSON braces.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text =
      typeof response.text === "function" ? await response.text() : "";

    let aiData;
    try {
      aiData = JSON.parse(text);
    } catch (err) {
      console.warn("⚠️ Gemini returned invalid JSON. Using fallback data.");
      aiData = {
        cards: [
          { title: "Sample Task 1", member: "Member 1" },
          { title: "Sample Task 2", member: "Member 2" },
        ],
        notes: ["Auto-generated project by AI"],
        events: [
          {
            title: "Kickoff Meeting",
            description: "Initial discussion",
            startDate: new Date().toISOString().slice(0, 10),
            endDate: new Date().toISOString().slice(0, 10),
            location: "Default Room",
          },
        ],
      };
    }

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: Array.isArray(members) ? members : [req.user._id],
      deadline,
    });

    const columnTitles = ["To-do", "In Progress", "Finished"];
    const createdColumns = [];
    for (const title of columnTitles) {
      const column = await Column.create({
        title,
        user: req.user._id,
        project: project._id,
        cards: [],
      });
      createdColumns.push(column);
    }

    if (Array.isArray(aiData.cards) && aiData.cards.length > 0) {
      const todoColumn = createdColumns.find((c) => c.title === "To-do");
      if (todoColumn) {
        const cards = aiData.cards.map((card) => ({
          member: card.member || "Unassigned",
          tasks: [card.title || "Untitled Task"],
          status: "to-do",
          user: req.user._id,
        }));
        todoColumn.cards.push(...cards);
        await todoColumn.save();
      }
    }

    if (Array.isArray(aiData.notes)) {
      for (const note of aiData.notes) {
        await Note.create({
          title: typeof note === "string" ? note.slice(0, 100) : "AI Note",
          content: typeof note === "string" ? note : JSON.stringify(note),
          user: req.user._id,
          projectId: project._id,
        });
      }
    }

    if (Array.isArray(aiData.events)) {
      for (const ev of aiData.events) {
        await Calendar.create({
          title: ev.title || "Untitled Event",
          description: ev.description || "",
          startDate: ev.startDate || null,
          endDate: ev.endDate || null,
          location: ev.location || "",
          labels: ev.labels || "",
          client: ev.client || "",
          shareWith: [],
          file: "",
          user: req.user._id,
          project: project._id.toString(),
          deadline: deadline ? new Date(deadline) : null,
        });
      }
    }

    return res.status(201).json({
      project,
      aiData,
      message:
        "AI project generated successfully with columns, cards, notes, and calendar events!",
    });
  } catch (err) {
    console.error("AI Generate Project Error:", err);
    return res.status(500).json({ error: err.message });
  }
};
