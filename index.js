const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
//Import Routes
const authRoute = require("./routes/auth");

// Connect to MongoDB
const uri = process.env.DB_CONNECT;
async function connectToDatabase() {
  try {
    await mongoose.connect(uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
  }
}

connectToDatabase();

// Middleware
app.use(express.json());
app.use(cors());

// Route Middleware
app.use("/api/auth", authRoute);

app.listen(8101, () => {
  console.log("Server is running on port 8101");
});
