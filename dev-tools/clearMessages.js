/** 
 * Development-only utility script to clear messages of all chats from the database (DO NOT USE IN PRODUCTION).
 * Useful for resetting the chat state during development or testing.
 * It is intended to be run as a standalone script.
 */

const mongoose = require('mongoose');
const Message = require('../models/Message');

async function clearMessages() {
  try {
    await mongoose.connect('YOUR_MONGODB_URI', // Replace with your MongoDB URI
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const result = await Message.deleteMany({});
    console.log(`Deleted ${result.deletedCount} messages`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error clearing messages:", error);
  }
}

clearMessages();
