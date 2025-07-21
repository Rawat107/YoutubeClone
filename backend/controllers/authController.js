// controllers/authController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Token generator
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Register User
export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const errors = {};
    if (!username) errors.username = "Username is required";
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    else if (password.length < 6)
      errors.password = "Password must be at least 6 characters";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(400).json({
        error:
          exists.email === email
            ? "Email already in use"
            : "Username already in use",
      });
    }

    const user = await User.create({ username, email, password });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    next(err);
  }
};

// Login User
export const loginUser = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    const errors = {};
    if (!email && !username)
      errors.identifier = "Email or username is required";
    if (email && username)
      errors.identifier = "Use either email or username (not both)";
    if (!password) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    let user;
    if (email) {
      user = await User.findOne({ email });
      if (!user) return res.status(404).json({ error: "Email not found" });
    } else {
      user = await User.findOne({ username });
      if (!user) return res.status(404).json({ error: "Username not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    next(err);
  }
};
