import { Router } from 'express';
import {
  getHistory,
  getOne,
  share,
  getShared,
  remove,
} from '../controllers/itinerary.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// public — share token route no auth neded
router.get('/shared/:token', getShared);

router.get('/',       protect, getHistory);
router.get('/:id',    protect, getOne);
router.patch('/:id/share',  protect, share);
router.delete('/:id', protect, remove);

export default router;