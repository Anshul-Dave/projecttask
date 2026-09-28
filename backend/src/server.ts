import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb', strict: false }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import boardRoutes from './routes/board.routes';
import initRoutes from './routes/init.routes';
import listRoutes from './routes/list.routes';
import taskRoutes from './routes/task.routes';
import memberRoutes from './routes/member.routes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/init', initRoutes);

app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Backend API' });
});

app.listen(port, () => {
  console.log(`\u26A1\uFE0F[server]: Server is running at http://localhost:${port}`);
});
