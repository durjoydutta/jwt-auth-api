import User from "../models/user.model.js";

export const getSelf = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.status(200).json({ user });
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }
  try {
    const user = await User.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user", error });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user", isDeleted: { $ne: true } });
    const admins = await User.find({ role: "admin", isDeleted: { $ne: true } });
    return res.status(200).json({ users, admins });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching users", error });
  }
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params; // id of user to be updated
  let { role } = req.body; // new user role
  role = role?.toLowerCase().trim(); // convert to lowercase
  if (!id || !role) {
    return res.status(400).json({ message: "User ID and role are required" });
  }
  if (role !== "admin" && role !== "user") {
    return res.status(400).json({ message: "Invalid role selected" });
  }
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role === role) {
      return res.status(400).json({
        message: `${user.username} already has the role: ${role.toUpperCase()}`,
      });
    }

    user.role = role;
    await user.save();

    return res
      .status(200)
      .json({ message: "User updated successfully", role: user.role });
  } catch (error) {
    return res.status(500).json({ message: "Error updating user", error });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params; // id of user to be deleted
  if (!id) {
    return res
      .status(400)
      .json({ message: "User ID is required for the user to be deleted" });
  }

  try {
    const delUser = await User.findOne({ _id: id });
    if (!delUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const currUser = req.user; // Changed from req.body?.user
    if (!currUser) {
      return res
        .status(404)
        .json({ message: "current user cannot be identified" });
    }
    // admins cannot delete other admins
    // only admins can delete users
    // admins can delete themselves
    console.log(currUser.username, delUser.username);
    if (currUser.username !== delUser.username && delUser.role === "admin") {
      return res.status(400).json({
        message: `[${delUser.username}] has Administrator privileges and cannot be deleted.`,
      });
    }
    
    delUser.isDeleted = true;
    delUser.deletedBy = req.userId; // Record who deleted the user
    await delUser.save();
    return res.status(200).json({
      success: true,
      message: `User ${delUser.username} has been successfully deleted.`,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting user", error });
  }
};

export const undeleteUser = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      message: "User ID is required for restoration",
    });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isDeleted) {
      return res.status(400).json({
        message: "User is not deleted and doesn't need restoration",
      });
    }

    // Restore the user
    user.isDeleted = false;
    user.deletedBy = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${user.username} has been successfully restored`,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error restoring user",
      error: error.message,
    });
  }
};

export const getDeletedUsers = async (req, res) => {
  try {
    const deletedUsers = await User.find({ isDeleted: true }).populate(
      "deletedBy",
      "username"
    );

    return res.status(200).json({
      count: deletedUsers.length,
      deletedUsers,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching deleted users",
      error: error.message,
    });
  }
};
