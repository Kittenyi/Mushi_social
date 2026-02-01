import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getUserProfile,
  updateUserProfile,
  followUser,
  unfollowUser
} from '../controllers/users.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/:id')
  .get(getUserProfile)
  .put(updateUserProfile);

router.put('/:id/follow', followUser);
router.put('/:id/unfollow', unfollowUser);

export default router;
