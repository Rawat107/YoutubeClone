import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"],
  },
  description: {
    type: String,
    default: "",
    maxlength: 1000,
  },
  banner: {
    type: String,
    default: "https://static.vecteezy.com/system/resources/previews/012/865/505/non_2x/idyllic-mountain-panoramic-landscape-fresh-green-meadows-and-blooming-wildflowers-sun-ray-beautiful-nature-countryside-view-rural-sunny-outdoor-natural-bright-banner-nature-spring-summer-panorama-photo.jpg",
  },
  avatar: {
    type: String,
    default: "",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subscribers: {
    type: Number,
    default: 0,
  },
  videos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Pre-save hook to set avatar
channelSchema.pre("save", function (next) {
  if (!this.avatar && this.name) {
    this.avatar = this.name.trim().charAt(0).toUpperCase();
  }
  next();
});

const Channel = mongoose.model('Channel', channelSchema);
export default Channel;