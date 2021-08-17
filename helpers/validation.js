const Joi = require("joi");
const registerData = (data) => {
  const schema = Joi.object({
    _id: Joi.allow(),
    firstname: Joi.string().alphanum().min(2).max(64).required(),
    lastname: Joi.string().alphanum().min(2).max(64).required(),
    compnyname: Joi.string().alphanum().min(2).max(64).required(),
    phoneno: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .required(),
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      }),
    username: Joi.string().alphanum().min(2).max(64).required(),

    // image: Joi.string().required(),
    password: Joi.string().min(6).max(64).required(),
    confirm_password: Joi.string().min(6).max(64).required(),
  });
  return schema.validate(data);
};
const loginData = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      }),
    password: Joi.string().min(6).max(64).required(),
  });
  return schema.validate(data);
};
const propertyData = (data) => {
  const schema = Joi.object({
    _id: Joi.allow(),
    school: Joi.array().items(Joi.string().min(2).max(64).required()),
    amenities: Joi.array().items(Joi.string().min(2).max(64).required()),
    pets: Joi.array().items(Joi.string().min(2).max(64).required()),
    date: Joi.string().required(),
    unitnumber: Joi.number().required(),
    bedroom: Joi.number().required(),
    bathroom: Joi.number().required(),
    squarefoot: Joi.number().required(),
    rent: Joi.number().required(),
    deposit: Joi.number().required(),
    address: Joi.string().trim().min(2).max(64).required(),
    propertytype: Joi.string().alphanum().min(2).max(64).required(),
    datetime: Joi.string().required(),
    time: Joi.string().required(),
    duration: Joi.string().required(),
    laundry: Joi.string().required(),

    // image: Joi.string().required(),
  });
  return schema.validate(data);
};
const regrenterData = (data) => {
  const schema = Joi.object({
    _id: Joi.allow(),
    firstname: Joi.string().alphanum().min(2).max(64).required(),
    lastname: Joi.string().alphanum().min(2).max(64).required(),
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      }),
    username: Joi.string().alphanum().min(2).max(64).required(),

    // image: Joi.string().required(),
    password: Joi.string().min(6).max(64).required(),
    confirm_password: Joi.string().min(6).max(64).required(),
    school: Joi.string().min(3).max(64).required(),
    bedroom: Joi.number().required(),
    topay: Joi.string().min(2).max(64).required(),
    commute: Joi.string().min(2).max(64).required(),
  });
  return schema.validate(data);
};

module.exports = {
  registerData,
  loginData,
  propertyData,
  regrenterData,
};
