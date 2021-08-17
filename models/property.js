const mongoose = require("mongoose");

const propertySchema = mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 64,
    },
    unitnumber: {
      type: Number,
      required: true,
      minlength: 2,
      maxlength: 64,
    },
    propertytype: {
      type: String,
      required: true,
    },
    bedroom: {
      type: Number,
      required: true,
    },
    bathroom: {
      type: Number,
      required: true,
    },
    squarefoot: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },

    school: {
      type: Array,
      required: true,
      minlength: 2,
      maxlength: 64,
    },
    amenities: {
      type: Array,
      required: true,
    },
    laundry: {
      type: String,
      required: true,
    },
    pets: {
      type: Array,
      required: true,
    },
    deposit: {
      type: Number,
      required: true,
    },
    rent: {
      type: Number,
      required: true,
    },
    datetime: {
      type: String,
    },
    time: { type: String },
  },

  { timestamps: true }
);

const Property = mongoose.model("property", propertySchema);
module.exports = Property;
