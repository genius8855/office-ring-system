const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// username -> socketId
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // User registers after socket connect
  socket.on("register", ({ username, role }) => {
    socket.username = username;
    socket.role = role;

    onlineUsers[username] = socket.id;

    // Send updated user list to admins
    io.emit("online-users", Object.keys(onlineUsers));
  });

  // Admin rings a user
  socket.on("ring-user", ({ username }) => {
    const targetSocketId = onlineUsers[username];
    if (targetSocketId) {
      io.to(targetSocketId).emit("incoming-ring");
    }
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      delete onlineUsers[socket.username];
      io.emit("online-users", Object.keys(onlineUsers));
    }
  });
});

server.listen(process.env.PORT || 3000);

