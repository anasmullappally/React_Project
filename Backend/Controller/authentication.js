const dotenv = require("dotenv");
dotenv.config();
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const Users = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const otpHandler = require("../otpHandler/otpHandler");
const { createError } = require("../createError");
const { generateAccessToken } = require("./authenticateTokens");
const jwt = require("jsonwebtoken");

module.exports = {
  googleSignIn: asyncHandler(async (req, res) => {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    let user = [];
    const { name, email, picture } = ticket.getPayload();
    user = { name, email, picture };
    let userExist = await Users.findOne({ email: email });
    // console.log(userExist);
    if (userExist) return res.status(200).json({ userExist });
    await Users.create({ ...user });
    return res.status(201).json({ name, email, picture });
  }),
  otpRequest: asyncHandler(async (req, res, next) => {
    let data = req.body;
    let user = await Users.findOne({
      $or: [{ phoneNumber: data.phoneNumber }, { email: data.email }],
    });
    if (user) return next(createError(409, "user already exists"));

    await otpHandler
      .make(data.phoneNumber)
      .then((verification) => console.log(verification));
    return res.status(200).json();
  }),
  verifyRegisterOtp: asyncHandler(async (req, res, next) => {
    let userDetails = req.body.data;
    let otp = req.body.otp;
    let response = await otpHandler.verifyOtp(otp, userDetails.phoneNumber);
    if (response.status == "approved") {
      let accessToken = generateAccessToken(userDetails);
      let refreshToken = jwt.sign(
        userDetails,
        process.env.REFRESH_TOKEN_SECRET
      );
      userDetails.refreshToken = refreshToken;
      let resp = await Users.create(userDetails);
      res.cookie("accessToken", accessToken, { maxAge: 6000, httpOnly: true });
      res.cookie("refreshToken", refreshToken, { httpOnly: true });
      res.cookie("uerId", resp._id, { httpOnly: true });
      return res.status(201).json({ messege: "User Added Successfully" });
    } else {
      return next(createError(409, "Invalid Otp"));
    }
  }),
  signIn: asyncHandler(async (req, res, next) => {
    let data = req.body;
    let user = await Users.findOne({ phoneNumber: data.phoneNumber });
    if (!user) return next(createError(409, "User Not exist"));

    otpHandler
      .make(data.phoneNumber)
      .then((verification) => console.log(verification));
    return res.status(200).json({ message: "otp send" });
  }),
  verifySignin: asyncHandler(async (req, res, next) => {
    console.log(req.body);
    let otp = req.body.otp;
    let phoneNumber = req.body.phoneNumber;
    let response = await otpHandler.verifyOtp(otp, phoneNumber);
    if (response.status == "approved") {
      return res.status(200).json({ message: "Sign-In success" });
    } else if (response.status == "pending") {
      return next(createError(409, "Invalid Otp"));
    } else {
      return next(createError(409, "Something Went wrong"));
    }
  }),
};
