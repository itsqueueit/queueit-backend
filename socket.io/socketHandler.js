const { Server } = require("socket.io");

function initializeSocket(server) {
  const io = new Server(server, {
    // Initialize Socket.IO server
    cors: {
      origin: process.env.FRONTEND_BASE_URL, // Set allowed origin
      methods: ["GET", "POST"], // Set allowed HTTP methods
    },
  });

  io.on("connection", (socket) => {
    // Handle Initial events here
    console.log(`User Connected: ${socket.id}`);
    socket.on("disconnect", () => {
      console.log("User disconnected");
      socket.removeAllListeners();
    });
    socket.on("join_room", (data) => {
      console.log("user_joined");
      socket.join(data.room);
      socket.to(123).emit("user_joined", data);
    });

    // Pub Sub messaging
    socket.on("send_message", (data) => {
      const now = new Date();
      data.time = now;
      socket.to(123).emit("receive_message", data);
    });

    // User Action watchers
    socket.on("user_typing", (data) => {
      console.log(data);
      socket.to(123).emit("people_typing", data);
    });
  });
}

module.exports = initializeSocket;
