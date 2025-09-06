import express from 'express';
import * as repliesController from '../controllers/replies.js';

const router = express.Router();

router.get('/:id', repliesController.getReply);
router.patch('/:id', repliesController.updateReply);
router.delete('/:id', repliesController.deleteReply);

export default router;
