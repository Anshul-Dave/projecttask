import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { asyncHandler } from '../utils/asyncHandler';

export const initDatabase = asyncHandler(async (req: Request, res: Response) => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const dbName = process.env.DB_NAME || 'projectstask_db';

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  await connection.query(`USE \`${dbName}\`;`);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      userEmail VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  try {
    await connection.query(`ALTER TABLE projects ADD COLUMN members JSON;`);
  } catch (e: any) {
    if (e.code !== 'ER_DUP_FIELDNAME') console.log(e);
  }

  await connection.query(`
    CREATE TABLE IF NOT EXISTS project_members (
      id INT AUTO_INCREMENT PRIMARY KEY,
      projectId VARCHAR(255) NOT NULL,
      userEmail VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'Member',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
      UNIQUE KEY unique_project_user (projectId, userEmail)
    );
  `);

  // Auto-migrate existing projects & JSON members into project_members table
  try {
    const [projects] = await connection.query<any[]>('SELECT id, userEmail, members FROM projects');
    for (const proj of projects) {
      if (proj.userEmail) {
        await connection.query(
          'INSERT IGNORE INTO project_members (projectId, userEmail, role) VALUES (?, ?, ?)',
          [proj.id, proj.userEmail, 'Owner']
        );
      }
      let memberEmails: string[] = [];
      if (proj.members) {
        memberEmails = typeof proj.members === 'string' ? JSON.parse(proj.members) : proj.members;
      }
      if (Array.isArray(memberEmails)) {
        for (const email of memberEmails) {
          if (email && email !== proj.userEmail) {
            await connection.query(
              'INSERT IGNORE INTO project_members (projectId, userEmail, role) VALUES (?, ?, ?)',
              [proj.id, email, 'Member']
            );
          }
        }
      }
    }
  } catch (err) {
    console.error("Migration error for project_members:", err);
  }

  await connection.query(`
    CREATE TABLE IF NOT EXISTS lists (
      id VARCHAR(255) PRIMARY KEY,
      projectId VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      orderIndex INT DEFAULT 0,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(255) PRIMARY KEY,
      listId VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      imageUrl TEXT,
      priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
      date VARCHAR(255),
      assignees JSON,
      tags JSON,
      orderIndex INT DEFAULT 0,
      FOREIGN KEY (listId) REFERENCES lists(id) ON DELETE CASCADE
    );
  `);

  await connection.end();

  res.json({ success: true, message: "Database and tables initialized successfully!" });
});
