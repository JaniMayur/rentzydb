const NodeGeocoder = require("node-geocoder");
require("dotenv").config("env");

const options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: "http",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
