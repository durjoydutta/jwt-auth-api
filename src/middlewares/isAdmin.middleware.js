const isAdmin = (req, res, next) => {
  const user = req.body?.user;
  if (!user) {
    return res
      .status(403)
      .json({ message: "Access Denied: User needs administrator privileges" });
  }
  if (user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied: User needs administrator privileges" });
  }
  next();
};

export default isAdmin;
