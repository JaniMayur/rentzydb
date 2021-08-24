const mongoose = require("mongoose");

const msgSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.ObjectId, ref: "Property" },
  landlord_id: { type: mongoose.Schema.ObjectId, ref: "Landlord" },
  renter_id: { type: mongoose.Schema.ObjectId, ref: "Renter" },
  message: String,
});

module.exports = mongoose.model("message", msgSchema);
