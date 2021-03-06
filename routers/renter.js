require("dotenv").config("../env");
const router = require("express").Router();
const Renter = require("../models/renter");
const Property = require("../models/property");
const mongoose = require("mongoose");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { regrenterData, loginData } = require("../helpers/validation");
// const auth = require("../helpers/admin-auth");
const multer = require("multer");
const fs = require("fs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const auth = require("../helpers/user-auth");
const _ = require("lodash");
const { func } = require("joi");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  console.log(req.body);
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    req.fileValidationError = "File must be valid";
    cb(null, false, req.fileValidationError);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

router.post("/renterRegister", upload.single("image"), async (req, res) => {
  try {
    console.log("rf", req.body);
    console.log("rf1", req.file);
    let new_img = "";
    if (req.file) {
      new_img = req.file.originalname;
    }
    if (req.fileValidationError) {
      return res.status(400).json({ message: "File must be valid" });
    }
    const { error } = await regrenterData(req.body);
    if (error && req.file) {
      let files = fs.readdirSync("./public/images");
      if (files.includes(req.file.originalname)) {
        fs.unlinkSync("./public/images/" + req.file.originalname);
      }
      return res.status(400).json({ message: error.details[0].message });
    }
    let renter = await Renter.findOne({ email: req.body.email });
    if (renter) {
      return res.status(400).json({ message: "Renter already exisits!" });
    } else {
      const password = await bcrypt.hash(req.body.password, 8);
      const repassword = await bcrypt.hash(req.body.confirm_password, 8);
      renter = new Renter({
        ...req.body,
        image: new_img,
        password: password,
        confirm_password: repassword,
      });
      await renter.save();

      const Token = jwt.sign({ _id: renter._id }, process.env.SECRETKEY);

      // const data = await Property.find({});
      // res.status(200).json({ data });
      res.status(200).json({ Token });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.post("/renterLogin", async (req, res) => {
  try {
    const { error } = await loginData(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { email, password } = req.body;
    const renter = await Renter.findOne({ email: email });
    if (!renter) {
      return res.json({ message: "Invalid credentials." });
    }
    const matchPassword = await bcrypt.compare(password, renter.password);
    if (!matchPassword)
      if (password !== renter.password)
        return res.json({ message: "Invalid credentials." });
    const Token = jwt.sign({ _id: renter._id }, process.env.SECRETKEY);

    res.status(200).json({ Token });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
router.post("/renter_forgotpass", async (req, res) => {
  try {
    const renter = await Renter.findOne({
      email: req.body.email,
    });
    if (!renter)
      return res.status(400).json({ message: "email not registered" });
    const resetpwdtoken = crypto.randomBytes(20).toString("hex");
    const otp = Math.floor(1000 + Math.random() * 9000);
    const forgotpass = await Renter.findOneAndUpdate(
      { email: req.body.email },
      {
        $set: {
          resetPasswordToken: resetpwdtoken,
          resetPasswordExpires: Date.now() + 3600000, //expires in an hour
          otp: otp,
        },
      }
    );
    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mj.idea2code@gmail.com",
        pass: "jani@1324@mayur",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      to: req.body.email,
      from: "mj.idea2code@gmail.com",
      subject: "Nodejs password reset",
      text:
        "You are receiving this email. Please click on the email for password reset " +
        "http://" +
        req.headers.host +
        "/resetpasswordrenter/" +
        resetpwdtoken +
        "\n\n" +
        "Your otp is " +
        otp +
        "\n\n" +
        "If you did not request this, please ignore this email",
    };
    smtpTransport.sendMail(mailOptions, function (err) {
      console.log("mail sent");
      return res.status(400).json({ message: "mail sent successfully" });
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
router.post("/resetpasswordrenter/:token", async (req, res) => {
  try {
    console.log(req.params.token);
    const renter = await Renter.findOne({
      resetPasswordToken: req.params.token,
      otp: req.body.otp,
    });
    if (!renter)
      return res
        .status(401)
        .send(" is invalid or has expired or OTP incorrect.");

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    const changepass = await Renter.findOneAndUpdate(
      { email: renter.email },
      {
        $set: {
          password: hashPassword,
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined,
          otp: undefined,
        },
      }
    );
    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mj.idea2code@gmail.com",
        pass: "jani@1324@mayur",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      to: renter.email,
      from: "mj.idea2code@gmail.com",
      subject: "Your password has been changed",
      html: `Hi ${renter.username} \n
        This is a confirmation that the password for your account ${renter.email} has just been changed.\n `,
    };
    smtpTransport.sendMail(mailOptions, function (err) {
      console.log("mail sent");
      return res.status(400).json({ message: "mail sent successfully" });
    });
  } catch (err) {
    console.log(err);
    res.json({ err });
  }
});
router.get("/renter_profile", auth, async (req, res) => {
  try {
    const renter = req.renter;
    const data = await Renter.find({ email: renter.email });
    res.status(200).json({ data });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
router.post(
  "/renter_editprofile",
  upload.single("image"),
  auth,
  async (req, res) => {
    try {
      const id = req.renter._id;
      const data = await Renter.findById(id);
      let new_img = "";
      if (req.fileValidationError) {
        return res.status(400).json({ message: "File must be valid" });
      }
      if (req.file) {
        new_image = req.file.originalname;
        fs.unlinkSync("./public/images/" + data.image);
      } else {
        new_image = data.image;
      }
      const updatedData = await Renter.findByIdAndUpdate(id, {
        ...req.body,
        image: new_image,
      });
      res.status(200).json({ message: "Profile Updated.." });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
);
router.get("/renter_property", auth, async (req, res) => {
  try {
    var response = [];
    const property = await Property.find({});

    response = _.uniqBy(response, "id");

    if (Object.keys(req.query).length === 0) {
      let data;
      if (req.renter.bedroom > 4) {
        data = await Property.find({
          $or: [
            { bedroom: { $gt: 4 } },
            { rent: req.renter.topay },
            { school: req.renter.school },
          ],
        });
      } else {
        data = await Property.find({
          $or: [
            { bedroom: req.renter.bedroom },
            { rent: req.renter.topay },
            { school: req.renter.school },
          ],
        });
      }
      response = data;
    }
    res.status(200).json({ response });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
router.post("/filter_property", auth, async (req, res) => {
  try {
    const updatedData = await Renter.findByIdAndUpdate(
      req.renter._id,
      { ...req.body },
      { new: true }
    );
    res.status(200).json({ message: "Propery Updated.." });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
router.get("/nearest_property", auth, async (req, res) => {
  try {
    console.log(req.renter);
    const prop = await Property.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [50, 50] },
          $maxDistance: 500,
          $minDistance: 0,
        },
      },
    });
    return res.status(200).json({ prop });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
router.post("/contact", auth, async function (req, res) {
  try {
    const id = req.renter._id;
    const data = await Renter.findById(id);
    console.log("ps", data.password);

    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "mj.idea2code@gmail.com",
        pass: "jani@1324@mayur",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    const mailOptions = {
      to: "mj.idea2code@gmail.com",
      from: req.body.email,
      subject: "Suggetions",
      text: req.body.description,
    };
    smtpTransport.sendMail(mailOptions, function (err) {
      console.log("mail sent");
      return res.status(400).json({ message: "mail sent successfully" });
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
router.post("/like/:id", auth, async function (req, res) {
  try {
    console.log(req.renter._id);
    const data = await Property.findByIdAndUpdate(
      req.params.id,
      {
        $push: { likedby: req.renter._id },
      },
      { new: true }
    );
    return res.status(400).json({ data });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
router.get("/liked", auth, async function (req, res) {
  try {
    const renter = await Renter.findById(req.renter._id);
    const data = await Property.find({ likedby: req.renter._id });
    res.status(200).json({ data, renter });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
// router.get("/liked/:id", auth, async function (req, res) {
//   try {
//     // const renter = await Renter.findOne({ _id: req.renter._id });
    // let id = mongoose.Types.ObjectId(req.params.id);

//     const data = await Property.findOne({
//       _id: req.params.id,
//       likedby: req.renter._id,
//     });
//     res.status(200).json({ data });
//   } catch (error) {
//     return res.status(400).json({ message: error.message });
//   }
// });
module.exports = router;
