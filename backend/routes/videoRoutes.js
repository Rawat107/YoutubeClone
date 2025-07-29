import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware.js';
import uploadWithLimits from '../middleware/multerConfig.js';
import Video from '../models/VideoModel.js';
import {
  uploadVideo,
  getAllVideos,
  getVideoById,
  getVideosByUser,
  getVideoComments,
  deleteVideo,
  toggleLike,
  toggleDislike,
  addComment,
  editComment,
  deleteComment,
  getChannelVideos
} from '../controllers/videoController.js';

const router = express.Router();

// Public routes
router.get('/videos', optionalAuth, getAllVideos);
router.get('/videos/:id', optionalAuth, getVideoById);
router.get('/videos/user/:userId', getVideosByUser);

// Channel videos route
router.get('/videos/channel/:channelId', getChannelVideos);

// Protected routes (require authentication)
router.post('/videos/upload', authenticateToken, uploadWithLimits, uploadVideo);
router.delete('/videos/:id', authenticateToken, deleteVideo);
router.post('/videos/:id/like', authenticateToken, toggleLike);
router.post('/videos/:id/dislike', authenticateToken, toggleDislike);

// Comment routes (all require authentication)
router.get('/videos/:id/comments', getVideoComments);
router.post('/videos/:id/comments', authenticateToken, addComment);
router.put('/videos/:videoId/comments/:commentId', authenticateToken, editComment);
router.delete('/videos/:videoId/comments/:commentId', authenticateToken, deleteComment);

export default router;