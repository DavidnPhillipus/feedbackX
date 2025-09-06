import express from 'express';
import * as postsController from '../controllers/posts.js';
import * as validation from '../middleware/validation.js';

const router = express.Router();

router.get('/', postsController.getPosts);
router.post('/', validation.createPost, postsController.createPost);

router.get('/:id', postsController.getPost);
router.patch('/:id', validation.updatePost, postsController.updatePost);
router.delete('/:id', postsController.deletePost);

router.post('/:id/likes', postsController.createLike);
router.delete('/:id/likes', postsController.deleteLike);

router.post('/:id/follows', postsController.createFollow);
router.delete('/:id/follows', postsController.deleteFollow);

router.get('/:id/replies', postsController.getReplies);
router.post('/:id/replies', postsController.createReply);

export default router;
