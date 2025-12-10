const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  sendMessage,
  getMessagesByChat,
  editMessage,
  deleteMessage,
  markMessageSeen,
} = require("../controllers/messageController");

router.post("/", authMiddleware, sendMessage);
router.get("/:chatId", authMiddleware, getMessagesByChat);
router.put("/:id", authMiddleware, editMessage);
router.delete("/:id", authMiddleware, deleteMessage);
router.put("/:id/seen", authMiddleware, markMessageSeen);

module.exports = router;
