import express from 'express';

const router = express.Router();

router.get('/:id', (_req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});
router.patch('/:id', (_req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});
router.delete('/:id', (_req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
