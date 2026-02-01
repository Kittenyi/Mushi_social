import express from 'express';
import { protect } from '../middleware/auth.js';
// import { ping, consultStart, consultEnd } from '../controllers/x402.js';

const router = express.Router();
router.use(protect);

// POST /api/x402/ping - Ping 免费交互
// POST /api/x402/consult/start - 咨询开始 (共生罩)
// POST /api/x402/consult/end - 咨询结束
// GET  /api/x402/consult/pricing - 大 V 定价 (e.g. 10 USDC/10min)
// router.post('/ping', ping);
// router.post('/consult/start', consultStart);
// router.post('/consult/end', consultEnd);
// router.get('/consult/pricing', getPricing);

export default router;
