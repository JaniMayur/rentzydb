require("dotenv").config("../env");
const router = require("express").Router();
const Landlord = require("../models/landlord");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerData, loginData } = require("../helpers/validation");
const auth = require("../helpers/admin-auth");
const multer = require("multer");
const fs = require("fs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
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

router.post("/landlordRegister", upload.single("image"), async (req, res) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({ message: "File must be valid" });
    } else if (!req.file) {
      return res
        .status(200)
        .json({ message: "Please select an image to upload" });
    }
    const { error } = await registerData(req.body);
    if (error) {
      let files = fs.readdirSync("./public/images");
      if (files.includes(req.file.originalname)) {
        fs.unlinkSync("./public/images/" + req.file.originalname);
      }
      return res.status(400).json({ message: error.details[0].message });
    }
    let landlord = await Landlord.findOne({ email: req.body.email });
    if (landlord) {
      return res.status(400).json({ message: "Landlord already exisits!" });
    } else {
      const password = await bcrypt.hash(req.body.password, 8);
      const repassword = await bcrypt.hash(req.body.confirm_password, 8);
      landlord = new Landlord({
        ...req.body,
        image: req.file.originalname,
        password: password,
        confirm_password: repassword,
      });
      await landlord.save();
      res.status(200).json({ landlord });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.post("/landlordLogin", async (req, res) => {
  try {
    const { error } = await loginData(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { email, password } = req.body;
    const landlord = await Landlord.findOne({ email: email });
    if (!landlord) {
      return res.json({ message: "Invalid credentials." });
    }
    const matchPassword = await bcrypt.compare(password, landlord.password);
    if (!matchPassword)
      if (password !== landlord.password)
        return res.json({ message: "Invalid credentials." });
    const Token = jwt.sign({ _id: landlord._id }, process.env.SECRETKEY);

    res.status(200).json({ Token });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
router.post("/forgotpass", async (req, res) => {
  try {
    const landlord = await Landlord.findOne({
      email: req.body.email,
    });
    if (!landlord)
      return res.status(400).json({ message: "email not registered" });
    const resetpwdtoken = crypto.randomBytes(20).toString("hex");
    const otp = Math.floor(1000 + Math.random() * 9000);
    const forgotpass = await Landlord.findOneAndUpdate(
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
        "/resetpasswordlandlord/" +
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
router.post("/resetpasswordlandlord/:token", async (req, res) => {
  try {
    console.log(req.params.token);
    const landlord = await Landlord.findOne({
      resetPasswordToken: req.params.token,
      otp: req.body.otp,
    });
    if (!landlord)
      return res
        .status(401)
        .send(" is invalid or has expired or OTP incorrect.");

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    const changepass = await Landlord.findOneAndUpdate(
      { email: landlord.email },
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
      to: landlord.email,
      from: "mj.idea2code@gmail.com",
      subject: "Your password has been changed",
      html: `Hi ${landlord.name} \n 
        This is a confirmation that the password for your account ${landlord.email} has just been changed.\n `,
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
router.get("/profile", auth, async (req, res) => {
  try {
    const landlord = req.landlord;
    const data = await Landlord.find({ email: landlord.email });
    res.status(200).json({ data });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
router.post("/editprofile", upload.single("image"), auth, async (req, res) => {
  try {
    const id = req.landlord._id;
    const data = await Landlord.findById(id);
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

    const updatedData = await Landlord.findByIdAndUpdate(id, {
      ...req.body,
      image: new_image,
    });

    // const updatedData = await Landlord.findByIdAndUpdate(id, datas, {
    //   new: true,
    // });
    // let files = fs.readdirSync("./public/images");
    // if (files.includes(data.image)) {
    //   fs.unlinkSync("./public/images/" + data.image);
    // }

    res.status(200).json({ message: "Profile Updated.." });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
