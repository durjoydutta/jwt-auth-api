import mongoose from "mongoose";

const TokenBlacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    tokenType: {
      type: String,
      enum: ["refresh", "access"],
      default: "refresh",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-delete expired documents
    },
    reason: {
      type: String,
      enum: ["logout", "rotation", "revoked"],
      default: "logout",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add a method to check if a token is blacklisted
TokenBlacklistSchema.statics.isBlacklisted = async function (token) {
  const blacklistedToken = await this.findOne({ token });
  return !!blacklistedToken;
};

// Add a method to blacklist a token
TokenBlacklistSchema.statics.blacklist = async function (
  token,
  tokenType,
  expiresAt,
  userId,
  reason = "logout"
) {
  return await this.create({
    token,
    tokenType,
    expiresAt,
    userId,
    reason,
  });
};

const TokenBlacklist =
  mongoose.models.tokenBlacklist ||
  mongoose.model("TokenBlacklist", TokenBlacklistSchema);

export default TokenBlacklist;
