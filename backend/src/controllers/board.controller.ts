import { Request, Response } from 'express';
import { getDbConnection } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { asyncHandler } from '../utils/asyncHandler';

export const getBoardData = asyncHandler(async (req: Request, res: Response) => {
  const pool = getDbConnection();
  const { projectId } = req.params;

  const [listRows] = await pool.query<RowDataPacket[]>('SELECT * FROM lists WHERE projectId = ? ORDER BY orderIndex ASC', [projectId]);

  if (listRows.length === 0) {
    return res.json([]);
  }

  const listIds = listRows.map(row => row.id);

  const [taskRows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM tasks WHERE listId IN (?) ORDER BY orderIndex ASC',
    [listIds.length > 0 ? listIds : ['placeholder']]
  );

  const formattedLists = listRows.map((list: any) => {
    const tasksForList = taskRows.filter((t: any) => t.listId === list.id).map((t: any) => ({
      ...t,
      assignees: t.assignees ? (typeof t.assignees === 'string' ? JSON.parse(t.assignees) : t.assignees) : [],
      tags: t.tags ? (typeof t.tags === 'string' ? JSON.parse(t.tags) : t.tags) : [],
    }));

    return {
      id: list.id,
      title: list.title,
      tasks: tasksForList
    };
  });

  res.json(formattedLists);
});

export const updateBoardData = asyncHandler(async (req: Request, res: Response) => {
  const { lists } = req.body;
  const pool = getDbConnection();
  const { projectId } = req.params;

  if (lists) {
    for (let i = 0; i < lists.length; i++) {
      const list = lists[i];
      await pool.query('UPDATE lists SET orderIndex = ? WHERE id = ? AND projectId = ?', [i, list.id, projectId]);

      if (list.tasks) {
        for (let j = 0; j < list.tasks.length; j++) {
          const task = list.tasks[j];
          await pool.query('UPDATE tasks SET listId = ?, orderIndex = ? WHERE id = ?', [list.id, j, task.id]);
        }
      }
    }
  }

  res.json({ success: true });
});

export const createList = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, list } = req.body;

  if (!projectId || !list || !list.id || !list.title) {
    return res.status(400).json({ error: "projectId and list object required" });
  }

  const pool = getDbConnection();
  await pool.query(
    'INSERT INTO lists (id, projectId, title) VALUES (?, ?, ?)',
    [list.id, projectId, list.title]
  );

  res.json({ success: true, message: "List created" });
});

export const updateList = asyncHandler(async (req: Request, res: Response) => {
  const { title, tasks } = req.body;
  const pool = getDbConnection();
  const { id } = req.params;

  if (title) {
    await pool.query('UPDATE lists SET title = ? WHERE id = ?', [title, id]);
  }

  if (tasks && Array.isArray(tasks)) {
    for (let i = 0; i < tasks.length; i++) {
      await pool.query('UPDATE tasks SET listId = ?, orderIndex = ? WHERE id = ?', [id, i, tasks[i].id]);
    }
  }

  res.json({ success: true, message: "List updated" });
});

export const deleteList = asyncHandler(async (req: Request, res: Response) => {
  const pool = getDbConnection();
  const { id } = req.params;

  await pool.query('DELETE FROM lists WHERE id = ?', [id]);
  res.json({ success: true, message: "List deleted" });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { listId, task } = req.body;

  if (!listId || !task || !task.id || !task.title) {
    return res.status(400).json({ error: "listId and task object required" });
  }

  const pool = getDbConnection();

  const assigneesJson = task.assignees ? JSON.stringify(task.assignees) : '[]';
  const tagsJson = task.tags ? JSON.stringify(task.tags) : '[]';

  await pool.query(
    'INSERT INTO tasks (id, listId, title, description, imageUrl, priority, date, assignees, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [task.id, listId, task.title, task.description || null, task.imageUrl || null, task.priority || 'Medium', task.date || null, assigneesJson, tagsJson]
  );

  res.json({ success: true, message: "Task created" });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;
  const pool = getDbConnection();
  const { id } = req.params;

  const updates: string[] = [];
  const values: any[] = [];

  const fields = ['title', 'description', 'imageUrl', 'priority', 'date'];
  fields.forEach(field => {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(data[field]);
    }
  });

  if (data.assignees !== undefined) {
    updates.push(`assignees = ?`);
    values.push(JSON.stringify(data.assignees));
  }

  if (data.tags !== undefined) {
    updates.push(`tags = ?`);
    values.push(JSON.stringify(data.tags));
  }

  if (updates.length > 0) {
    values.push(id);
    await pool.query(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, values);
  }

  res.json({ success: true, message: "Task updated" });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const pool = getDbConnection();
  const { id } = req.params;

  await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
  res.json({ success: true, message: "Task deleted" });
});
