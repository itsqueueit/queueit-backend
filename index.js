// Import necessary modules
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const server = require("http").createServer(app); // Create HTTP server
const initializeSocket = require("./socket.io/socketHandler"); // Import Socket.IO handler

const { authenticateSpotifyApi } = require("./middleware/spotify/spotifySetup");

// Initialize Spotify API
authenticateSpotifyApi().catch((error) => {
  console.error("Error initializing Spotify API:", error);
  process.exit(1);
});

// Import Routes
const authRoute = require("./routes/auth");
const featuredPlaylistsRoute = require("./routes/featuredPlaylists");
const searchTracksRoute = require("./routes/searchTracks");

// Import PORT
const PORT = process.env.PORT || 8080;

// Connect to MongoDB
const uri = process.env.DB_CONNECT; // MongoDB connection URI
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
app.use("/api/featured-playlists", featuredPlaylistsRoute);
app.use("/api/search-tracks", searchTracksRoute);

// Initialize Socket.IO
initializeSocket(server);

// Start the HTTP server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
