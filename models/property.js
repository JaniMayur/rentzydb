const mongoose = require("mongoose");
const geocoder = require("../utils/geocoder");

const propertySchema = mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 64,
    },
    loc: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
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
    likedby: {
      type: mongoose.Schema.ObjectId,
      ref: "Renter",
    },
    landlord_id: { type: mongoose.Schema.ObjectId, ref: "Landlord" },
    time: { type: String },
    status: { type: Boolean, default: false },
  },

  { timestamps: true }
);
propertySchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);
  console.log(loc);
  this.loc = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
  };
  // this.address = undefined;
  next();
});
const Property = mongoose.model("property", propertySchema);
module.exports = Property;
