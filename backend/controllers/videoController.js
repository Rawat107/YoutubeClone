import Video from '../models/Video.js';
import Channel from '../models/Channel.js';
import mongoose from 'mongoose';

// Get videos by channel ID
export const getVideosByChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const videos = await Video.find({ channelId })
      .populate('userId', 'username email')
      .populate('channelId', 'name username')
      .sort({ uploadDate: -1 });

    res.json({ videos });
  } catch (error) {
    console.error('Get channel videos error:', error);
    res.status(500).json({ message: 'Failed to fetch channel videos' });
  }
};

// Upload a new video
export const uploadVideo = async (req, res) => {
  try {
    const { title, description, category, tags, visibility } = req.body;

    if (!title || !req.files?.video) {
      return res.status(400).json({
        error: 'Title and video file are required'
      });
    }

    // Get user's channel
    const channel = await Channel.findOne({ userId: req.user._id });
    if (!channel) {
      return res.status(400).json({
        error: 'You must create a channel before uploading videos'
      });
    }

    const videoPath = req.files.video[0].path;
    const thumbnailPath = req.files.thumbnail ? req.files.thumbnail[0].path : null;

    const video = new Video({
      title,
      description: description || '',
      videoUrl: videoPath,
      thumbnailUrl: thumbnailPath,
      category: category || 'Other',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      visibility: visibility || 'public',
      userId: req.user._id,
      channelId: channel._id,
      comments: [], // Initialize empty comments array
      commentCount: 0
    });

    await video.save();

    // Add video to channel's videos array
    await Channel.findByIdAndUpdate(channel._id, {
      $push: { videos: video._id }
    });

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: {
        id: video._id,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        category: video.category,
        uploadDate: video.uploadDate,
        views: video.views,
        likes: video.likes,
        dislikes: video.dislikes,
        commentCount: video.commentCount
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
};

// Get all videos
export const getAllVideos = async (req, res) => {
  try {
    const { category, search, limit = 20, page = 1 } = req.query;
    let query = {};

    query.$or = [
      { isSampleData: true },
      { isSampleData: { $ne: true }, visibility: 'public' }
    ];

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const videos = await Video.find(query)
      .populate({
        path: 'userId',
        select: 'username avatar',
        match: { _id: { $exists: true } }
      })
      .populate({
        path: 'channelId',
        select: 'name username',
        match: { _id: { $exists: true } }
      })
      .sort({ uploadDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const transformedVideos = videos.map(video => {
      const videoObj = video.toObject();
      if (!videoObj.isSampleData && videoObj.channelId) {
        videoObj.channelName = videoObj.channelId.name;
      }
      return videoObj;
    });

    const totalVideos = await Video.countDocuments(query);

    res.json({
      success: true,
      videos: transformedVideos,
      totalPages: Math.ceil(totalVideos / limit),
      currentPage: parseInt(page),
      totalVideos
    });
  } catch (error) {
    console.error('Get all videos error:', error);
    res.status(500).json({ message: 'Failed to fetch videos' });
  }
};

// Get single video by ID with comments
export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id)
      .populate({
        path: 'channelId',
        select: 'name username',
        match: { _id: { $exists: true } }
      })
      .populate({
        path: 'userId',
        select: 'username avatar',
        match: { _id: { $exists: true } }
      });

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Increment view count
    video.views = (video.views || 0) + 1;
    await video.save();

    res.json({
      success: true,
      video
    });
  } catch (error) {
    console.error('Get video by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch video' });
  }
};

// Controller to fetch comments for a video
export const getVideoComments = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.json({ comments: video.comments || [] });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};


// Add comment to video
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;
    const username = req.user.username;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      text: text.trim(),
      user: username,
      userId: userId,
      timestamp: new Date(),
      isSampleComment: false
    };

    video.comments.unshift(newComment); // Add to beginning
    await video.save();

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Edit comment
export const editComment = async (req, res) => {
  try {
    const { videoId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const comment = video.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to edit this comment' });
    }

    comment.text = text.trim();
    comment.timestamp = new Date();
    await video.save();

    res.json({
      message: 'Comment updated successfully',
      comment: comment
    });
  } catch (error) {
    console.error('Edit comment error:', error);
    res.status(500).json({ error: 'Failed to edit comment' });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { videoId, commentId } = req.params;
    const userId = req.user._id;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const comment = video.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }

    video.comments.pull(commentId);
    await video.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

// Get videos by user ID
export const getVideosByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const videos = await Video.find({ userId })
      .populate('userId', 'username avatar')
      .populate('channelId', 'name username')
      .sort({ uploadDate: -1 });

    res.json(videos);
  } catch (error) {
    console.error('Get user videos error:', error);
    res.status(500).json({ error: 'Failed to fetch user videos' });
  }
};

// Delete video
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to delete this video' });
    }

    // Remove video from channel's videos array
    await Channel.findByIdAndUpdate(video.channelId, {
      $pull: { videos: video._id }
    });

    await Video.findByIdAndDelete(id);

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
};

// Like/Unlike video
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    video.likes += 1;
    await video.save();

    res.json({
      message: 'Video liked',
      likes: video.likes
    });
  } catch (error) {
    console.error('Like video error:', error);
    res.status(500).json({ error: 'Failed to like video' });
  }
};

// Dislike video
export const toggleDislike = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    video.dislikes += 1;
    await video.save();

    res.json({
      message: 'Video disliked',
      dislikes: video.dislikes
    });
  } catch (error) {
    console.error('Dislike video error:', error);
    res.status(500).json({ error: 'Failed to dislike video' });
  }
};
