"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.me = exports.logout = exports.register = exports.login = void 0;
const db_1 = require("../config/db");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    const pool = (0, db_1.getDbConnection)();
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
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
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    const pool = (0, db_1.getDbConnection)();
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
        return res.status(400).json({ message: "Email is already registered" });
    }
    const name = `${firstName} ${lastName || ''}`.trim();
    await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
    res.json({ success: true, message: "Registration successful" });
});
exports.logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    res.cookie('userEmail', '', { maxAge: 0, path: '/' });
    res.json({ success: true, message: "Logged out" });
});
exports.me = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
    const pool = (0, db_1.getDbConnection)();
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [userEmail]);
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
exports.changePassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({ message: "Email, old password, and new password are required" });
    }
    const pool = (0, db_1.getDbConnection)();
    // Verify old password
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, oldPassword]);
    if (rows.length === 0) {
        return res.status(401).json({ message: "Invalid email or old password" });
    }
    // Update with new password
    const [result] = await pool.query('UPDATE users SET password = ? WHERE email = ?', [newPassword, email]);
    if (result.affectedRows === 0) {
        return res.status(500).json({ message: "Failed to update password" });
    }
    res.json({ success: true, message: "Password updated successfully" });
});
