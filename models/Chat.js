const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    isGroup: {
      type: Boolean,
      default: false,
    },
    members: [
      {
        type: String, // use task-tracker user ids (string)
        ref: "User",
      },
    ],
    creatorId: {
      type: String,
      ref: "User",
    },
    groupName: {
      type: String,
      trim: true,
    },
    groupAvatar: String,
    pinnedMessages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],
    admins: [
      {
        type: String,
        ref: "User",
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    archivedBy: [
      {
        type: String,
        ref: "User",
      },
    ],
    mutedBy: [
      {
        type: String,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
