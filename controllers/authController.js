// Chat service now uses task-tracker auth only
// These routes are disabled; chat uses token verification from task-tracker

const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/jwt");

const register = async (req, res) => {
  res.status(501).json({ message: "Chat service uses task-tracker authentication. Register/login via task-tracker backend." });
};

const login = async (req, res) => {
  res.status(501).json({ message: "Chat service uses task-tracker authentication. Register/login via task-tracker backend." });
};

module.exports = {
  register,
  login,
};
