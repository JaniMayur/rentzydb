const jwt = require("jsonwebtoken");
const Renter = require("../models/renter");
require("dotenv").config();
module.exports = async function (req, res, next) {
  if (!req.headers["authorization"])
    return res.status(401).json({ message: "Access Denied" });
  let token = req.headers["authorization"].split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access Denied" });
  try {
    const verified = jwt.verify(token, process.env.SECRETKEY);

    const renter = await Renter.findById(verified._id);
    if (!renter) {
      return res.status(400).json({ message: "Access Denied" });
    }
    req.token = token;
    req.renter = renter;
    next();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
