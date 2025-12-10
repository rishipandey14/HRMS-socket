const Message = require("../models/Message");
const Chat = require("../models/Chat");

// @desc    Send a new message
// @route   POST /api/messages
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id?.toString();
    let { chatId, receiverId, content, type, fileUrl, replyTo, forwardedFrom } =
      req.body;

    let chat;

    if (!chatId) {
      if (!receiverId) {
        return res
          .status(400)
          .json({ error: "receiverId is required if chatId is not given" });
      }

      chat = await Chat.findOne({
        isGroup: false,
        members: { $all: [senderId, receiverId], $size: 2 },
      });

      if (!chat) {
        chat = await Chat.create({
          isGroup: false,
          members: [senderId, receiverId],
        });
      }

      chatId = chat._id;
    } else {
      chat = await Chat.findById(chatId);
      if (!chat) return res.status(404).json({ error: "Chat not found" });
    }

    const message = await Message.create({
      chatId,
      senderId,
      content,
      type,
      fileUrl,
      replyTo,
      forwardedFrom,
    });

    chat.latestMessage = message._id;
    await chat.save();

    const fullMessage = await Message.findById(message._id)
      .populate("replyTo");

    res.status(201).json(fullMessage);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc    Get messages of a Chat by chat ID
// @route   GET /api/messages/:chatId
const getMessagesByChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId })
      .populate("replyTo")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc    Edit a message
// @route   PUT /api/messages/:id
const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { newContent } = req.body;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (message.senderId !== req.user._id?.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    message.content = newContent;
    message.isEdited = true;
    await message.save();

    req.io?.to(message.chatId.toString()).emit("edit_message", message);

    res.status(200).json(message);
  } catch (err) {
    console.error("Edit message error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc    Delete a message for everyone (hard delete)
// @route   DELETE /api/messages/:id
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (message.senderId !== req.user._id?.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // message.isDeleted = true;    //soft delete
    // message.content = "";
    // await message.save();

    await Message.findByIdAndDelete(id);

    req.io?.to(message.chatId.toString()).emit("delete_message", message._id);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete message error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc    Mark a message as seen
// @route   PUT /api/messages/:id/seen
const markMessageSeen = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    message.status.set(userId, "seen");
    await message.save();

    res.status(200).json({ message: "Message marked as seen", messageId });
  } catch (err) {
    console.error("markMessageSeen error:", err);
    res.status(500).json({ error: "Failed to mark message as seen" });
  }
};

module.exports = {
  sendMessage,
  getMessagesByChat,
  editMessage,
  deleteMessage,
  markMessageSeen,
};
