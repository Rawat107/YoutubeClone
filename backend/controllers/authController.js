import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

// Function to generate JWT token with user ID and username
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" } // Token expires in 7d
  );
};

// Handle user registration
export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Basic input validation
    const errors = {};
    if (!username) errors.username = "Username is required";
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters";

    // If there are validation errors, send them back
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Check if email or username already exists
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(400).json({
        error:
          exists.email === email
            ? "Email already in use"
            : "Username already in use",
      });
    }

    const hash = bcrypt.hashSync(password, 10);
    // Create and save new user
    const user = await User.create({ username, email, password: hash });

    // Respond with success message
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    // Pass any errors to the global error handler
    next(err);
  }
};

// Handle user login
export const loginUser = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    // Basic input validation
    const errors = {};
    if (!email && !username)
      errors.identifier = "Email or username is required";
    if (email && username)
      errors.identifier = "Use either email or username (not both)";
    if (!password) errors.password = "Password is required";

    // If validation fails, return errors
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Find user by email or username
    let user;
    if (email) {
      user = await User.findOne({ email });
      if (!user) return res.status(404).json({ errors: {identifier: "Email not found" } });
    } else {
      user = await User.findOne({ username });
      if (!user) return res.status(404).json({ errors: {identifier: "Username not found" } });
    }

    // Compare passwords using bcrypt compareSync
    const valid = bcrypt.compareSync(password, user.password);
    if(!valid){
      return res.status(401).josn({errors: {password: "Invalid Password"}})
    }
    

    // Generate JWT token
    const token = generateToken(user);

    // Remove password from user object before sending response
    const { password: _PW, ...safeUser } = user.toObject();

    // Send user data and token
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
    // Pass any errors to the global error handler
    next(err);
  }
};


// Handle forgot password request
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() }).lean();

  if (!user)
    return res
      .status(404)
      .json({ ok: false, message: "No user found with that e-mail." });

  // For now this project, just returning the user ID
  res.json({ ok: true, userId: user._id });
};

// Handle resetting password using userId
export const resetPassword = async (req, res) => {
  const { userId } = req.params;
  const { password } = req.body;

  // Validate new password
  if (!password || password.length < 6)
    return res
      .status(400)
      .json({ ok: false, message: "Password must be at least 6 characters." });

  // Find user by ID
  const user = await User.findById(userId);
  if (!user)
    return res.status(404).json({ ok: false, message: "User not found." });

  // Update user's password 
  const hash = bcrypt.hashSync(password, 10)
  user.password = hash; 
  await user.save();

  // Respond with success
  res.json({ ok: true, message: "Password reset successful." });
};
