import { Request, Response } from 'express';
import { getDbConnection } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { asyncHandler } from '../utils/asyncHandler';

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const pool = getDbConnection();
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM projects');

  const projects = rows.map((row: any) => ({
    ...row,
    members: row.members ? (typeof row.members === 'string' ? JSON.parse(row.members) : row.members) : []
  }));

  res.json(projects);
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const { id, name, description, userEmail, members } = req.body;

  if (!id || !name || !userEmail) {
    return res.status(400).json({ error: "id, name, and userEmail are required" });
  }

  const pool = getDbConnection();

  if (members && Array.isArray(members) && members.length > 0) {
    for (const email of members) {
      const [userRows] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [email]);
      if (userRows.length === 0) {
        return res.status(400).json({ message: `User with email "${email}" is not registered in the system.` });
      }
    }
  }

  const membersJson = members ? JSON.stringify(members) : JSON.stringify([]);

  await pool.query(
    'INSERT INTO projects (id, name, description, userEmail, members) VALUES (?, ?, ?, ?, ?)',
    [id, name, description || '', userEmail, membersJson]
  );

  try {
    await pool.query(
      'INSERT IGNORE INTO project_members (projectId, userEmail, role) VALUES (?, ?, ?)',
      [id, userEmail, 'Owner']
    );
  } catch (e) {
    console.error("Error inserting project owner to project_members", e);
  }

  res.json({ success: true, message: "Project created" });
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const pool = getDbConnection();
  const { id } = req.params;

  await pool.query('DELETE FROM projects WHERE id = ?', [id]);
  res.json({ success: true, message: "Project deleted" });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, members } = req.body;
  const pool = getDbConnection();

  const updates: string[] = [];
  const values: any[] = [];

  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }
  if (members !== undefined) {
    if (Array.isArray(members)) {
      for (const email of members) {
        const [userRows] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [email]);
        if (userRows.length === 0) {
          return res.status(400).json({ message: `User with email "${email}" is not registered in the system.` });
        }
      }
    }
    updates.push('members = ?');
    values.push(JSON.stringify(members));
  }

  if (updates.length === 0) {
    // Return early if there's nothing to update
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  values.push(id);
  const query = `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`;
  await pool.query(query, values);

  res.json({ success: true, message: "Project updated" });
});

