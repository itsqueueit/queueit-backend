const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  venueType: {
    type: String,
    required: true,
  },
  venueName: {
    type: String,
    required: true,
  },
  venueId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Venues", UserSchema);
