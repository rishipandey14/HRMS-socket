const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createGroupChat,
  getAllChats,
  getChatById,
  updateGroupChat,
  toggleArchive,
  toggleMute,
  deleteGroup,
  leaveGroup,
} = require("../controllers/chatController");

router.post("/group", authMiddleware, createGroupChat);
router.get("/", authMiddleware, getAllChats);
router.get("/:id", authMiddleware, getChatById);
router.put("/group/:id", authMiddleware, updateGroupChat);
router.put("/:id/archive", authMiddleware, toggleArchive);
router.put("/:id/mute", authMiddleware, toggleMute);
router.delete("/:id", authMiddleware, deleteGroup);
router.put("/group/:id/leave", authMiddleware, leaveGroup);

module.exports = router;
