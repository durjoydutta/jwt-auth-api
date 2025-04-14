import User from "../models/user.model.js";
import { NODE_ENV } from "../../config/env.config.js";
import sendVerificationMailHelper from "../../utils/sendVerificationMailHelper.js";

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
      if (!existingUser.isVerified) {
        // Resend verification email
        await sendVerificationMailHelper(existingUser);

        return res.status(409).json({
          success: false,
          message:
            "User already exists but is not verified. A new verification email has been sent.",
          isVerified: false, // Flag to indicate unverified user
        });
      }

      return res.status(409).json({
        success: false,
        message: "User already exists.",
        isVerified: true, // Flag to indicate verified duplicate user
      });
    }

    const newUser = new User({
      username,
      email,
      password,
      isVerified: false, // Mark user as unverified initially
    });

    await newUser.save();

    if (newUser) {
      // Send verification email
      await sendVerificationMailHelper(newUser);

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

    if (!user.isVerified) {
      // User is not verified, send verification email again
      await sendVerificationMailHelper(user);
      return res.status(403).json({
        success: false,
        message:
          "Verfication Email sent. Please verify your email before logging in",
        isVerified: false, // Flag to indicate unverified user
      });
    }

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
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
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

// to verify the otp sent by the user and the one stored in the database
// and to update the user status to verified
export const verifyOTP = async (req, res) => {
  try {
    const { username, otp } = req.body;

    if (!username || !otp) {
      return res.status(400).json({
        success: false,
        message: "Username and OTP are required",
      });
    }

    const user = await User.findOne({ username }).select(
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

export const sendVerificationMail = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already verified",
      });
    }

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
