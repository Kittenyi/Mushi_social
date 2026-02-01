import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createPost,
  getPosts,
  getPostById,
  likePost,
  unlikePost,
  addComment,
  deletePost
} from '../controllers/posts.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getPosts)
  .post(createPost);

router.route('/:id')
  .get(getPostById)
  .delete(deletePost);

router.put('/:id/like', likePost);
router.put('/:id/unlike', unlikePost);
router.put('/:id/comments', addComment);

export default router;
