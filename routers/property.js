require("dotenv").config("../env");
const router = require("express").Router();
const Landlord = require("../models/landlord");
const Property = require("../models/property");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { propertyData } = require("../helpers/validation");
const auth = require("../helpers/admin-auth");
router.get("/allproperty", async (req, res) => {
  try {
    const data = await Property.find({});
    res.status(200).json({ data });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
router.get("/property", auth, async (req, res) => {
  try {
    const data = await Property.find({ landlord_id: req.landlord._id });
    res.status(200).json({ data });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
router.get("/property/:id", auth, async (req, res) => {
  try {
    const data = await Property.findById(req.params.id);
    res.status(200).json({ data });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
router.post("/addproperty", auth, async (req, res) => {
  try {
    // console.log("jj", req.landlord.lastname);
    const { error } = await propertyData(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    let property = await Property.findOne({ address: req.body.address });
    if (property) {
      return res
        .status(400)
        .json({ message: "That property already exisits!" });
    } else {
      property = new Property({
        ...req.body,
        landlord_id: req.landlord._id,
      });
      await property.save();
      res.status(200).json({ property });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/property_update/:id", auth, async function (req, res) {
  try {
    const updatedData = await Property.findByIdAndUpdate(req.params.id, {
      ...req.body,
    });

    res.status(200).json({ message: "Propery Updated.." });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
router.delete("/property_delete/:id", auth, async function (req, res) {
  try {
    const dd = await Property.findById(req.params.id);
    const deletedData = await Property.findByIdAndDelete(dd._id);
    res.status(200).json({ message: "Property Deleted.." });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
