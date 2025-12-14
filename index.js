const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("register", ({ username, role }) => {
    console.log("📝 Register event:", username, role);

    const uname = username.trim().toLowerCase();
    socket.username = uname;
    socket.role = role;

    onlineUsers[uname] = socket.id;

    console.log("👥 Online users:", Object.keys(onlineUsers));

    io.emit("online-users", Object.keys(onlineUsers));
  });

  socket.on("ring-user", ({ username }) => {
    console.log("🔔 Ring request for:", username);

    const target = onlineUsers[username];
    if (target) {
      io.to(target).emit("incoming-ring");
      console.log("✅ Ring sent to:", username);
    } else {
      console.log("❌ User not found:", username);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);

    if (socket.username) {
      delete onlineUsers[socket.username];
      console.log("👥 Online users:", Object.keys(onlineUsers));
      io.emit("online-users", Object.keys(onlineUsers));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("🚀 Server listening on port", PORT);
});
