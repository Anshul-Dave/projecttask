import { Router } from 'express';
import { createProject, deleteProject, getProjects, updateProject } from '../controllers/project.controller';

const router = Router();

router.get('/', getProjects);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
