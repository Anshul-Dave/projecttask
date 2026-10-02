import { Router } from 'express';
import { createList, updateList, deleteList } from '../controllers/board.controller';

const router = Router();

router.post('/', createList);
router.put('/:id', updateList);
router.delete('/:id', deleteList);

export default router;
