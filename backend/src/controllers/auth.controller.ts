import { Request, Response } from 'express';
import { getDbConnection } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { asyncHandler } from '../utils/asyncHandler';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const pool = getDbConnection();

  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);

  if (rows.length === 0) {
    return res.status(401).json({ message: "Invalid credentials or user not found" });
  }

  const user = rows[0];
  const parts = user.name.split(' ');
  const firstName = parts[0];
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';

  const userData = {
    id: user.id,
    email: user.email,
    firstName,
    lastName,
  };

  // Set a simple cookie to remember the user for 30 days
  res.cookie('userEmail', user.email, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30 * 1000 // 30 days in ms
  });

  res.json(userData);
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const pool = getDbConnection();

  const [existing] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    return res.status(400).json({ message: "Email is already registered" });
  }

  const name = `${firstName} ${lastName || ''}`.trim();
  await pool.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password]
  );

  res.json({ success: true, message: "Registration successful" });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.cookie('userEmail', '', { maxAge: 0, path: '/' });
  res.json({ success: true, message: "Logged out" });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const cookieHeader = req.headers.cookie;
  let userEmail = null;

  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const emailCookie = cookies.find(c => c.startsWith('userEmail='));
    if (emailCookie) {
      userEmail = decodeURIComponent(emailCookie.split('=')[1]);
    }
  }

  if (!userEmail) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const pool = getDbConnection();
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [userEmail]);

  if (rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  const user = rows[0];
  const parts = user.name.split(' ');
  const firstName = parts[0];
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';

  const userData = {
    id: user.id,
    email: user.email,
    firstName,
    lastName,
  };

  res.json(userData);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ message: "Email, old password, and new password are required" });
  }

  const pool = getDbConnection();

  // Verify old password
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ? AND password = ?', [email, oldPassword]);

  if (rows.length === 0) {
    return res.status(401).json({ message: "Invalid email or old password" });
  }

  // Update with new password
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE users SET password = ? WHERE email = ?',
    [newPassword, email]
  );

  if (result.affectedRows === 0) {
    return res.status(500).json({ message: "Failed to update password" });
  }

  res.json({ success: true, message: "Password updated successfully" });
});
