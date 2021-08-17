const mongoose = require("mongoose");

const landlordSchema = mongoose.Schema(
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

    compnyname: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 64,
    },
    phoneno: {
      type: String,
      unique: true,
      required: true,
      maxlength: 10,
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
    image: {
      type: String,
    },
    resetPasswordToken: String,
    otp: String,
    resetPasswordExpires: Date,
  },

  { timestamps: true }
);

const Landlord = mongoose.model("landlord", landlordSchema);
module.exports = Landlord;
