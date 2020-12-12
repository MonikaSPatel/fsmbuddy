import mongoose from "mongoose";
const NotificationSchema = new mongoose.Schema({
  title: {
    type: "STRING",
    required: true
  },
  data: {
    type: "JSON"
  },
  status: {
    type: "NUMBER",
    required: true
  }
});

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;
