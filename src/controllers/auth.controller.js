import User from "../models/user.model.js";
import { NODE_ENV } from "../../config/env.config.js";
import sendVerificationMailHelper from "../../utils/sendVerificationMailHelper.js";
import sendPasswordResetMailHelper from "../../utils/sendPasswordResetMailHelper.js";
import { genOTP, otpExpires } from "../../utils/generateOTP.js";

const cookieOptions = {
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  httpOnly: true,
  secure: NODE_ENV === "production", // use secure in production
  sameSite: NODE_ENV === "production" ? "None" : "Lax",
};

export const signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email) {
      return res.status(400).send("Both Username and email are required");
    }
    if (!password) {
      return res.status(400).send("Password is required");
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Sorry, this username or email is already taken.",
      });
    }

    const newUser = new User({
      username,
      email,
      password,
    });

    await newUser.save();

    if (newUser) {
      return res.status(201).json({
        success: true,
        message: "User created successfully. Please verify your email.",
        data: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
      });
    } else {
      return res.status(400).send("Unable to create user");
    }
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Find user by username and include password for verification
    const user = await User.findOne({ username }).select("+password");

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: `Sorry, User ${user.username} is blocked`,
      });
    }

    // if (!user.isVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Please verify your email before logging in",
    //     isVerified: false, // Flag to indicate unverified user
    //   });
    // }

    // Check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = await user.generateAuthToken();

    res.cookie("jwt", token, cookieOptions);

    // Send response
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      data: {
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred during sign in",
      error: error.message,
    });
  }
};

export const signOut = (req, res) => {
  try {
    res.clearCookie("jwt", cookieOptions);
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred during sign out",
      error: error.message,
    });
  }
};

// this controller will use the auth middleware to check if the user is authenticated
// and will return the response accordingly
export const isAuthenticated = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "User is authenticated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred during authentication",
      error: error.message,
    });
  }
};

export const sendVerificationMail = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findOne({ _id: userId }).select(
      "+verifyOTP +verifyOTPExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: `Sorry, User ${user.username} is blocked`,
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already verified",
      });
    }

    if (user.verifyOTPExpires && user.verifyOTPExpires > Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Please wait before requesting a new verification code",
      });
    }

    user.verifyOTP = genOTP();
    user.verifyOTPExpires = otpExpires();
    await user.save();

    await sendVerificationMailHelper(user);

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while sending verification email",
      error: error.message,
    });
  }
};

// to verify the otp sent by the user and the one stored in the database
// and to update the user status to verified
export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "User ID and OTP are required",
      });
    }

    const user = await User.findOne({ _id: userId }).select(
      "+verifyOTP +verifyOTPExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isBlocked || user.isVerified) {
      return res.status(403).json({
        success: false,
        message: `Sorry, User ${user.username} is ineligible for verification`,
      });
    }

    if (
      !user.verifyOTP ||
      user.verifyOTP !== otp ||
      user.verifyOTPExpires < Date.now()
    ) {
      // console.log("OTP mismatch: ", user.verifyOTP, otp);
      return res.status(400).json({
        success: false,
        message: "The OTP you entered is either incorrect or has expired",
      });
    }

    user.isVerified = true;
    user.verifyOTP = undefined;
    user.verifyOTPExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred during OTP verification",
      error: error.message,
    });
  }
};

export const sendPasswordResetMail = async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email && !username) {
      return res.status(400).json({
        success: false,
        message: "Either email or username is required",
      });
    }

    const user = await User.findOne({ $or: [{ email }, { username }] }).select(
      "+resetOTP +resetOTPExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: `Sorry, User ${user.username} is blocked`,
      });
    }

    if (user.resetOTPExpires && user.resetOTPExpires > Date.now()) {
      return res.status(400).json({
        success: false,
        message:
          "A password reset code has already been sent. Please wait for it to expire.",
      });
    }

    user.resetOTP = genOTP();
    user.resetOTPExpires = otpExpires();
    await user.save();

    await sendPasswordResetMailHelper(user);

    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
      username: user.username,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while sending password reset email",
      error: error.message,
    });
  }
};

export const verifyPasswordResetOTP = async (req, res) => {
  try {
    const { username, otp, newPassword } = req.body;

    if (!username || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Username, OTP, and new password are required",
      });
    }

    const user = await User.findOne({ username }).select(
      "+resetOTP +resetOTPExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.resetOTP !== otp || user.resetOTPExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "The OTP you entered is either incorrect or has expired",
      });
    }

    user.password = newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password has been reset successfully. Log in with your new password.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `An error occurred during OTP verification: ${error.message}`,
    });
  }
};
