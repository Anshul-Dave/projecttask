import { Router } from 'express';
import { createTask, updateTask, deleteTask } from '../controllers/board.controller';

const router = Router();

router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
