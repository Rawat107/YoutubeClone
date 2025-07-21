import Channel from '../models/Channel.js';
import User from '../models/User.js';
import Video from '../models/Video.js';

export const createChannel = async (req, res, next) => {
  try {
    const { name, username, description } = req.body;
    const userId = req.user._id;
    
    // Handle banner upload if present
    let bannerUrl = '';
    if (req.file) {
      // If using multer for file upload
      bannerUrl = `/uploads/banners/${req.file.filename}`;
    }

    const errors = {};
    if (!name || name.trim().length < 3) {
      errors.name = 'Channel name must be at least 3 characters';
    }
    if (!username || username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const existingChannel = await Channel.findOne({ userId });
    if (existingChannel) {
      return res.status(400).json({
        message: 'You already have a channel',
        channel: existingChannel
      });
    }

    const existingUsername = await Channel.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({
        errors: { username: 'Username is already taken' }
      });
    }

    const channel = new Channel({
      name: name.trim(),
      username: username.toLowerCase().trim(),
      description: description?.trim() || '',
      banner: bannerUrl, // Save the banner URL
      userId,
    });

    await channel.save();

    await User.findByIdAndUpdate(userId, {
      $push: { channels: channel._id }
    });

    res.status(201).json({
      message: 'Channel created successfully',
      channel: {
        _id: channel._id,
        name: channel.name,
        username: channel.username,
        description: channel.description,
        banner: channel.banner,
        avatar: channel.avatar,
        subscribers: channel.subscribers,
        userId: channel.userId,
        createdAt: channel.createdAt,
      }
    });

  } catch (error) {
    console.error('Create channel error:', error);
    next(error);
  }
};


export const getUserChannel = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // FIXED: Better query with proper population
    const channel = await Channel.findOne({ userId })
      .populate('videos')
      .lean(); // Use lean() for better performance
    
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // FIXED: Ensure consistent response structure
    res.json({ 
      success: true,
      channel: {
        ...channel,
        userId: channel.userId.toString() // Ensure string format for comparison
      }
    });
  } catch (error) {
    console.error('Get user channel error:', error);
    next(error);
  }
};

export const getChannelByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    
    // FIXED: Better error handling and consistent response
    const channel = await Channel.findOne({ username: username.toLowerCase() })
      .populate('userId', 'username email')
      .populate('videos')
      .lean();

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    res.json({ 
      success: true,
      channel: {
        ...channel,
        userId: channel.userId._id || channel.userId // Handle populated vs non-populated userId
      }
    });
  } catch (error) {
    console.error('Get channel by username error:', error);
    next(error);
  }
};

export const getAllChannels = async (req, res, next) => {
  try {
    const channels = await Channel.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ 
      success: true,
      channels 
    });
  } catch (error) {
    console.error('Get all channels error:', error);
    next(error);
  }
};

export const updateChannel = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, description, banner } = req.body;

    const channel = await Channel.findOne({ userId });
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    if (name) channel.name = name.trim();
    if (description !== undefined) channel.description = description.trim();
    if (banner !== undefined) channel.banner = banner;

    await channel.save();

    res.json({
      message: 'Channel updated successfully',
      success: true,
      channel
    });
  } catch (error) {
    console.error('Update channel error:', error);
    next(error);
  }
};

export const deleteChannel = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const channel = await Channel.findOne({ userId });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    await Video.deleteMany({ channelId: channel._id });
    await User.findByIdAndUpdate(userId, {
      $pull: { channels: channel._id }
    });
    await Channel.findByIdAndDelete(channel._id);

    res.json({ 
      message: 'Channel deleted successfully',
      success: true 
    });
  } catch (error) {
    console.error('Delete channel error:', error);
    next(error);
  }
};
