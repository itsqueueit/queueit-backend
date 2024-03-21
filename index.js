// Import necessary modules
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const server = require("http").createServer(app); // Create HTTP server
const { Server } = require("socket.io"); // Import Socket.IO
const io = new Server(server, {
  // Initialize Socket.IO server
  cors: {
    origin: "http://localhost:5173", // Set allowed origin
    methods: ["GET", "POST"], // Set allowed HTTP methods
  },
});

// Import Routes
const authRoute = require("./routes/auth");

// Connect to MongoDB
const uri = process.env.DB_CONNECT; // MongoDB connection URI
// async function connectToDatabase() {
//   try {
//     await mongoose.connect(uri, {
//       // Connect to MongoDB
//       useUnifiedTopology: true,
//       useNewUrlParser: true,
//     });
//     console.log("Connected to MongoDB Atlas");
//   } catch (error) {
//     console.error("Error connecting to MongoDB Atlas:", error);
//     process.exit(1); // Exit the process if unable to connect to MongoDB
//   }
// }
async function connectToDatabase() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    process.exit(1); // Exit the process if unable to connect to MongoDB
  }
}

connectToDatabase(); // Call the function to connect to MongoDB

// Middleware
app.use(express.json()); // Parse incoming JSON requests
app.use(cors()); // Enable CORS

// Route Middleware
app.use("/api/auth", authRoute); // Set up authentication routes

// Start the HTTP server
server.listen(8101, () => {
  console.log("Server is running on port 8101");
});

// Socket.IO connection
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
    let i = 1
    console.log(data);
    socket.to(123).emit("people_typing", data);
  });
});