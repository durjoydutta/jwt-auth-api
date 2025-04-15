import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../../config/env.config.js";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[\w-_.]+@([\w-.]+.)+[\w-]{2,3}$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    verifyOTP: {
      type: String,
      select: false,
    },
    verifyOTPExpires: {
      type: Date,
      select: false,
    },
    resetOTP: {
      type: String,
      select: false,
    },
    resetOTPExpires: {
      type: Date,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password before saving
UserSchema.pre("save", async function (next) {
  // Only hash the password if it's modified or new
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.pre("updateOne", async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    try {
      update.password = await bcrypt.hash(update.password, 10);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to generate access token
UserSchema.methods.generateAuthToken = async function () {
  return await jwt.sign(
    { _id: this._id, username: this.username, email: this.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Method to verify user's access token
UserSchema.statics.findByToken = async function (token) {
  try {
    const decoded = await jwt.verify(token, JWT_SECRET);
    return decoded._id;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

// Method to check if entered password is correct
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.users || mongoose.model("User", UserSchema);

export default User;
