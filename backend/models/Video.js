import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
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
      required: function() { return !this.isSampleData; } // Only required for real uploads
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function() { return !this.isSampleData; } // Only required for real uploads
    },
    // For sample data videos
    channelName: {
      type: String,
      required: function() { return this.isSampleData; } // Only required for sample data
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
  },
  { timestamps: true }
);

const Video = mongoose.model('Video', videoSchema);

export default Video;