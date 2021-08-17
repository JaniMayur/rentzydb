const mongoose = require("mongoose");

const renterSchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 64,
    },
    lastname: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 64,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 64,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 64,
    },
    confirm_password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 64,
    },
    school: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 64,
    },
    bedroom: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    topay: {
      type: String,
      required: true,
    },
    commute: {
      type: String,
      required: true,
    },

    resetPasswordToken: String,
    otp: String,
    resetPasswordExpires: Date,
  },

  { timestamps: true }
);

const Renter = mongoose.model("renter", renterSchema);
module.exports = Renter;
