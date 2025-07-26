import Channel from '../models/Channel.js';
import User from '../models/User.js';
import Video from '../models/Video.js';

// Create a new channel for the logged-in user
export const createChannel = async (req, res, next) => {
  try {
    const { name, username, description, banner } = req.body;
    const userId = req.user._id;

    //Validating Input field
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

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Check if user already has a channel
    const existingChannel = await Channel.findOne({ userId });
    if (existingChannel) {
      return res.status(400).json({
        message: 'You already have a channel',
        channel: existingChannel
      });
    }

    // Check if the username is already taken
    const existingUsername = await Channel.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({
        errors: { username: 'Username is already taken' }
      });
    }

    // Handle banner - now it's a URL string instead of file upload
    let bannerUrl = '';
    if (banner && banner.trim()) {
      bannerUrl = banner.trim();
    }

    // Create and save new channel
    const channel = new Channel({
      name: name.trim(),
      username: username.toLowerCase().trim(),
      description: description?.trim() || '',
      banner: bannerUrl, // Save the banner URL
      userId,
    });

    await channel.save();

    // Add channel reference to the user
    await User.findByIdAndUpdate(userId, {
      $push: { channels: channel._id }
    });

    // Respond with channel info
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

// Get the current logged-in user's channel
export const getUserChannel = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch the channel and populate its videos
    const channel = await Channel.findOne({ userId })
      .populate('videos')
      .lean();

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Respond with the user's channel
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

// Get a channel by its username
export const getChannelByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    // Find channel by username and populate related data
    const channel = await Channel.findOne({ username: username.toLowerCase() })
      .populate('userId', 'username email') // Fetch basic user info
      .populate('videos') // Include channel's videos
      .lean();

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Respond with channel info
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

// Get all channels in the system
export const getAllChannels = async (req, res, next) => {
  try {
    const channels = await Channel.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 }) // Newest channels first
      .lean();

    // Respond with list of channel
    res.json({
      success: true,
      channels
    });
  } catch (error) {
    console.error('Get all channels error:', error);
    next(error);
  }
};

// Update the current user's channel
export const updateChannel = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, username, description, banner } = req.body;
    // Find channel by user ID
    const channel = await Channel.findOne({ userId });
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Update channel fields if provided
    if (name) channel.name = name.trim();
    if (username) {
       channel.username = username.toLowerCase().trim();
    }
    if (description !== undefined) channel.description = description.trim();
    if (banner !== undefined) channel.banner = banner;

    await channel.save();

    // Respond with updated channel info
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

