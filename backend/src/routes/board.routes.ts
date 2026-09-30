import { Router } from 'express';
import { 
  createList, createTask, deleteList, deleteTask, 
  getBoardData, updateBoardData, updateList, updateTask 
} from '../controllers/board.controller';

const router = Router();

// Board Data (Lists & Tasks) for a project
router.get('/:projectId', getBoardData);
router.put('/:projectId', updateBoardData);

export default router;
