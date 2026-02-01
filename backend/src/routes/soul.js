import express from 'express';
import { getSoulByAddress } from '../controllers/soul.js';

const router = express.Router();

// GET /api/soul/:address — 0x 或 ENS，返回 raw + tags
router.get('/:address', getSoulByAddress);

export default router;
