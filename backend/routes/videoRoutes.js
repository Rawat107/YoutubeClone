// routes/videoRoutes.js
import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware.js';
import uploadWithLimits from '../middleware/multerConfig.js';
import Video from '../models/Video.js'; // FIXED: Added missing import
import {
  uploadVideo,
  getAllVideos,
  getVideoById,
  getVideosByUser,
  updateVideo,
  deleteVideo,
  toggleLike,
  toggleDislike
} from '../controllers/videoController.js';

const router = express.Router();

// Public routes
router.get('/videos', optionalAuth, getAllVideos);
router.get('/videos/:id', optionalAuth, getVideoById);
router.get('/videos/user/:userId', getVideosByUser);

// FIXED: Proper route handler with error handling
router.get('/videos/channel/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    const videos = await Video.find({ channelId })
      .populate('userId', 'username email')
      .sort({ uploadDate: -1 });
    
    res.json({ videos });
  } catch (error) {
    console.error('Get channel videos error:', error);
    res.status(500).json({ message: 'Failed to fetch channel videos', videos: [] });
  }
});

// Protected routes (require authentication)
router.post('/videos/upload', authenticateToken, uploadWithLimits, uploadVideo);
router.put('/videos/:id', authenticateToken, updateVideo);
router.delete('/videos/:id', authenticateToken, deleteVideo);
router.post('/videos/:id/like', authenticateToken, toggleLike);
router.post('/videos/:id/dislike', authenticateToken, toggleDislike);

export default router;
