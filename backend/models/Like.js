// models/Like.js
import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    default: null
  },
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  type: {
    type: String,
    enum: ['like', 'dislike'],
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one like/dislike per user per video/comment
likeSchema.index({ userId: 1, videoId: 1 }, { unique: true, sparse: true });
likeSchema.index({ userId: 1, commentId: 1 }, { unique: true, sparse: true });

// Ensure either videoId or commentId is provided, but not both
likeSchema.pre('save', function(next) {
  if (!this.videoId && !this.commentId) {
    return next(new Error('Either videoId or commentId must be provided'));
  }
  if (this.videoId && this.commentId) {
    return next(new Error('Cannot like both video and comment simultaneously'));
  }
  next();
});

const Like = mongoose.model('Like', likeSchema);
export default Like;