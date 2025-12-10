const http = require("http");
const dotenv = require("dotenv");
const app = require("./app");
const connectDB = require("./config/db");
const { setupSocket } = require("./sockets/socket");

dotenv.config();

const PORT = process.env.PORT || 5001;
const server = http.createServer(app);
const io = setupSocket(server);

app.use((req, res, next) => {
  req.io = io;
  next();
});

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
