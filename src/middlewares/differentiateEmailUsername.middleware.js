const differentiateEmailUsername = (req, res, next) => {
  const userInput =
    req.body?.username?.toLowerCase() || req.body?.email?.toLowerCase();
  if (!userInput || userInput?.trim() === "") {
    return res.status(400).json({ error: "Username or email is required" });
  }

  const isEmail = userInput.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
  if (isEmail) {
    req.body.email = userInput;
  } else {
    req.body.username = userInput;
  }
  next();
};

export default differentiateEmailUsername;
