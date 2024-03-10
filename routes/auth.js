const router = require("express").Router();
const Club = require("../models/Clubs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verify = require("../jwt/verifyToken");

// add clubs
router.post("/add-club", async (req, res) => {
  try {
    console.log(req.body);
    const getClub = await Club.findOne({ clubId: req.body.clubId });
    if (getClub) {
      return res.status(400).json({
        success: false,
        message: "Club already exists",
      });
    }
    const newClub = new Club({
      clubType: req.body.clubType,
      clubName: req.body.clubName,
      clubId: req.body.clubId,
    });

    await newClub.save();

    return res.status(201).json({
      success: true,
      message: "Club added successfully",
      data: newClub,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get club information using a QR code.
router.get("/get-clubs/", async (req, res) => {
  try {
    const CLUB_ID = req.query.club_id;
    if (!CLUB_ID) {
      return res.status(400).json({
        success: false,
        message: "Club ID is required in query parameters",
      });
    }
    const getClub = await Club.findOne({ clubId: CLUB_ID });
    // Check if club exists
    if (!getClub) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    // Create and assign a token
    const token = jwt.sign({ _id: getClub._id }, process.env.TOKEN_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(
      { _id: getClub._id },
      process.env.REFRESH_TOKEN_SECRET
    );
    res.json({
      success: true,
      data: { token },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
