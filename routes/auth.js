const router = require("express").Router();
const Club = require("../models/Clubs");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verify = require("../jwt/verifyToken");
const { randomInt } = require("crypto");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const verifySid = "VA063566b1499e86f7f81cd09274d12f17";

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
      data: { token, data: getClub },
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

    const existingUser = await User.findOne({ number });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with the same number already exists",
      });
    }
    client.verify.v2
      .services(verifySid)
      .verifications.create({ to: "+917738517189", channel: "sms" })
      .then((verification) => console.log(verification.status))
      .then(() => {
        const readline = require("readline").createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        readline.question("Please enter the OTP:", (otpCode) => {
          client.verify.v2
            .services(verifySid)
            .verificationChecks.create({ to: "+917738517189", code: otpCode })
            .then((verification_check) =>
              console.log(verification_check.status)
            )
            .then(() => readline.close());
        });
      });
    res.status(200).json({
      success: true,
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

    if (verificationCheck.status === "approved") {
      const newUser = new User({
        user_name,
        number,
        user_id,
      });
      await newUser.save();
      return res.status(200).json({
        success: true,
        message: "OTP verified successfully",
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
