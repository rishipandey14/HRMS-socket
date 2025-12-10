const axios = require("axios");

// Use localhost for local dev, task-tracker-backend for Docker
const TASK_TRACKER_URL = process.env.TASK_TRACKER_URL || 
  (process.env.NODE_ENV === "production" 
    ? "http://task-tracker-backend:7000" 
    : "http://localhost:7000");

// Verify token by calling task-tracker backend; no local DB queries
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Access Denied: No token provided" });
  }

  try {
    // Call task-tracker verify endpoint
    const response = await axios.get(`${TASK_TRACKER_URL}/api/auth/verify-token`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });

    if (!response.data?.user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Attach minimal user data from task-tracker response
    // Convert 'id' from verify-token response to '_id' for compatibility with controllers
    req.user = {
      _id: response.data.user.id,
      ...response.data.user,
    };
    req.userType = response.data.user.type; // 'user' or 'company'
    req.userRole = response.data.user.role;

    next();
  } catch (err) {
    console.error("Chat auth error:", err.message);
    const status = err.response?.status || 401;
    const msg = err.response?.data?.msg || err.message || "Invalid or expired token";
    return res.status(status).json({ message: msg });
  }
};

module.exports = authMiddleware;
