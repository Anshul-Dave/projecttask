import { Router } from 'express';
import { getMembers, addMember, removeMember } from '../controllers/member.controller';

const router = Router();

router.get('/:projectId', getMembers);
router.post('/:projectId', addMember);
router.delete('/:projectId/:email', removeMember);

export default router;
