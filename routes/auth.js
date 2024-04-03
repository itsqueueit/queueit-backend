const router = require("express").Router();
const Venue = require("../models/Venue");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const verify = require("../middleware/jwt/verifyToken");
const { randomInt } = require("crypto");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const verifySid = "VA063566b1499e86f7f81cd09274d12f17";

// add Venue
router.post("/add-venue", async (req, res) => {
  try {
    console.log(req.body);
    const getVenue = await Venue.findOne({ venueId: req.body.venueId });
    if (getVenue) {
      return res.status(400).json({
        success: false,
        message: "Venue already exists",
      });
    }
    const newVenue = new Venue({
      venueType: req.body.venueType,
      venueName: req.body.venueName,
      venueId: req.body.venueId,
    });

    await newVenue.save();

    return res.status(201).json({
      success: true,
      message: "Venue added successfully",
      data: newVenue,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get Venue information using a QR code.
router.get("/get-venue/", async (req, res) => {
  try {
    const venue_Id = req.query.venue_id;
    if (!venue_Id) {
      return res.status(400).json({
        success: false,
        message: "Venue ID is required in query parameters",
      });
    }
    const getVenue = await Venue.findOne({ venueId: venue_Id });
    // Check if Venue exists
    if (!getVenue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found",
      });
    }

    // Create and assign a token
    const token = jwt.sign({ _id: getVenue._id }, process.env.TOKEN_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(
      { _id: getVenue._id },
      process.env.REFRESH_TOKEN_SECRET
    );
    res.json({
      success: true,
      token,
      data: getVenue,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Route to sign up using phone number
router.post("/sign-up", async (req, res) => {
  try {
    const { number } = req.body;
    client.verify.v2
      .services(verifySid)
      .verifications.create({ to: `+91${number}`, channel: "sms" })
      .then((verification) => console.log(verification.status))
      .then((res) => console.log(res));
    res.status(200).json({
      success: true,
      otp: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { number, otp, user_name, user_id } = req.body;

    const verificationCheck = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: `+91${number}`, code: otp });

    console.log(verificationCheck.status); // Check the status for debugging
    // Create and assign a token
    const token = jwt.sign({ user_id }, process.env.TOKEN_SECRET, {
      expiresIn: "1h",
    });
    if (verificationCheck.status === "approved") {
      const existingUser = await User.findOne({ number });
      if (existingUser) {
        return res.status(200).json({
          success: true,
          token,
          message: "OTP verified successfully",
          user: existingUser,
        });
      }
      const newUser = new User({
        user_name,
        number,
        user_id,
      });
      await newUser.save();
      return res.status(200).json({
        success: true,
        token,
        message: "OTP verified successfully",
        user: existingUser,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
