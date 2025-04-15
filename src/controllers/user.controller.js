import User from "../models/user.model.js";

export const getSelf = async (req, res) => {
  const user = req.body?.user;
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
    const user = await User.findById(id);
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
    const users = await User.find({ role: "user" });
    const admins = await User.find({ role: "admin" });
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
      return res.status(400).json({ message: `${user.username} already has the role: ${role.toUpperCase()}` });
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
    return res.status(400).json({ message: "User ID is required" });
  }
  console.log(req);
  try {
    const delUser = await User.findOne({ _id: id });
    if (!delUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (delUser.role === "admin") {
      return res
        .status(400)
        .json({ message: `[${delUser.username}] has Administrator privileges and cannot be deleted.` });
    }
    await User.deleteOne({ _id: id }); // delete the user
    return res.status(200).json({ 
        success: true,
        message: `User ${delUser.username} has been successfully deleted from the database.` });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting user", error });
  }
};
