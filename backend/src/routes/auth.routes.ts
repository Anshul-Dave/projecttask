import { Router } from 'express';
import { login, logout, me, register, changePassword } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/change-password', changePassword);
router.post('/logout', logout);
router.get('/me', me);

export default router;
