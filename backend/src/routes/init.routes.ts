import { Router } from 'express';
import { initDatabase } from '../controllers/init.controller';

const router = Router();

router.get('/', initDatabase);

export default router;
