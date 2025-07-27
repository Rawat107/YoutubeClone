import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.isSampleComment; }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isSampleComment: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  videoUrl: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    enum: ['Education', 'Tech', 'Music', 'Sports', 'Movies', 'Entertainment', 'Gaming', 'Fashion', 'Other'],
    default: 'Other',
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  // Comments array with subdocuments
  comments: [commentSchema],
  commentCount: {
    type: Number,
    default: 0
  },
  // Track upload method to handle video playback correctly
  uploadMethod: {
    type: String,
    enum: ['file', 'url'],
    default: 'file'
  },
  // For user-uploaded videos
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: function() { return !this.isSampleData; }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.isSampleData; }
  },
  // For sample data videos
  channelName: {
    type: String,
    required: function() { return this.isSampleData; }
  },
  isSampleData: {
    type: Boolean,
    default: false
  },
  visibility: {
    type: String,
    enum: ['public', 'unlisted', 'private'],
    default: 'public'
  },
  tags: [{
    type: String,
    trim: true
  }],
}, { timestamps: true });

// Update comment count whenever comments array changes
videoSchema.pre('save', function(next) {
  this.commentCount = this.comments.length;
  next();
});

const Video = mongoose.model('Video', videoSchema);

export default Video;