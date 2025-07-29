// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: "",
  },
  channels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
    },
  ],
}, {
  timestamps: true,
});

// Pre-save hook to set avatar
userSchema.pre("save", function (next) {
  if (!this.avatar && this.username) {
    this.avatar = this.username.trim().charAt(0).toUpperCase();
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
