import express from 'express';
import { 
  createChannel, 
  getUserChannel, 
  getChannelByUsername, 
  getAllChannels,
  updateChannel,
  deleteChannel 
} from '../controllers/channelController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (require authentication)
router.post('/channels', authMiddleware, createChannel);
router.get('/channels/my', authMiddleware, getUserChannel);
router.put('/channels/my', authMiddleware, updateChannel);
router.delete('/channels/my', authMiddleware, deleteChannel);

// Public routes
router.get('/channels', getAllChannels);
router.get('/channels/:username', getChannelByUsername);

export default router;