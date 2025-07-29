import express from 'express';
import { 
  createChannel, 
  getUserChannel, 
  getChannelByUsername, 
  getAllChannels,
  updateChannel, 
} from '../controllers/channelController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes (require authentication)
router.post('/channels', authenticateToken, createChannel);
router.get('/channels/my', authenticateToken, getUserChannel);
router.put('/channels/my', authenticateToken, updateChannel);
// Public routes (for futture if we want to fetch every user channel)
router.get('/channels', getAllChannels);
router.get('/channels/:username', getChannelByUsername);

export default router;