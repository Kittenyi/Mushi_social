import express from 'express';
import { protect } from '../middleware/auth.js';
// import { updateLocation, getNearby } from '../controllers/location.js';

const router = express.Router();
router.use(protect);

// PUT /api/location - 上报 H3 网格位置 (位置快照)
// GET  /api/location/nearby - 附近用户 (LBS)
// router.put('/', updateLocation);
// router.get('/nearby', getNearby);

export default router;
