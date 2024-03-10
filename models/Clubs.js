const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  clubType: {
    type: String,
    required: true,
  },
  clubName: {
    type: String,
    required: true,
  },
  clubId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Clubs", UserSchema);
