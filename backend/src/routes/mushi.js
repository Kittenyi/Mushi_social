import express from 'express';
import { protect } from '../middleware/auth.js';
// import { getMushiState } from '../controllers/mushi.js';

const router = express.Router();
router.use(protect);

// GET /api/mushi/me - 当前用户 Mushi 阶段与 Persona
// GET /api/mushi/:userId - 他人 Mushi 展示 (脱敏)
// router.get('/me', getMushiState);
// router.get('/:userId', getMushiState);

export default router;
