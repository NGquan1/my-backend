import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    startDate: String,
    endDate: String,
    startTime: String,
    endTime: String,
    location: String,
    labels: String,
    client: String,
    shareWith: [String],
    file: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: String, required: true },
  },
  { timestamps: true }
);

const Calendar = mongoose.model("Calendar", eventSchema);
export default Calendar;
