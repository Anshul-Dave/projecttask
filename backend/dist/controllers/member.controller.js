"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMember = exports.addMember = exports.getMembers = void 0;
const db_1 = require("../config/db");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getMembers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { projectId } = req.params;
    const pool = (0, db_1.getDbConnection)();
    const [projectRows] = await pool.query('SELECT userEmail FROM projects WHERE id = ?', [projectId]);
    if (projectRows.length === 0) {
        return res.status(404).json({ message: "Project not found" });
    }
    const [memberRows] = await pool.query('SELECT userEmail, role, created_at FROM project_members WHERE projectId = ?', [projectId]);
    res.json({
        owner: projectRows[0].userEmail,
        members: memberRows.map(row => row.userEmail),
        details: memberRows
    });
});
exports.addMember = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { projectId } = req.params;
    const { email, role } = req.body;
    if (!email || !email.trim()) {
        return res.status(400).json({ message: "Email is required" });
    }
    const targetEmail = email.trim().toLowerCase();
    const pool = (0, db_1.getDbConnection)();
    // 1. Verify user registration in `users` table
    const [userRows] = await pool.query('SELECT id FROM users WHERE email = ?', [targetEmail]);
    if (userRows.length === 0) {
        return res.status(400).json({
            message: `User with email "${targetEmail}" is not registered in the system.`
        });
    }
    // 2. Fetch target project
    const [projectRows] = await pool.query('SELECT userEmail FROM projects WHERE id = ?', [projectId]);
    if (projectRows.length === 0) {
        return res.status(404).json({ message: "Project not found" });
    }
    const projectOwner = projectRows[0].userEmail;
    if (projectOwner && projectOwner.toLowerCase() === targetEmail) {
        return res.status(400).json({ message: "User is already the owner of this project" });
    }
    // 3. Check if already a member in `project_members` table
    const [existingMember] = await pool.query('SELECT id FROM project_members WHERE projectId = ? AND userEmail = ?', [projectId, targetEmail]);
    if (existingMember.length > 0) {
        return res.status(400).json({ message: "User is already a member of this project" });
    }
    // 4. Insert into `project_members` table
    const memberRole = role || 'Member';
    await pool.query('INSERT INTO project_members (projectId, userEmail, role) VALUES (?, ?, ?)', [projectId, targetEmail, memberRole]);
    // 5. Fetch updated members list from `project_members` table
    const [updatedMemberRows] = await pool.query('SELECT userEmail FROM project_members WHERE projectId = ? AND role != "Owner"', [projectId]);
    const memberEmails = updatedMemberRows.map(r => r.userEmail);
    // Sync to projects table JSON column for backwards compatibility
    await pool.query('UPDATE projects SET members = ? WHERE id = ?', [JSON.stringify(memberEmails), projectId]);
    res.json({
        success: true,
        message: `User ${targetEmail} added successfully!`,
        members: memberEmails
    });
});
exports.removeMember = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { projectId, email } = req.params;
    if (!email) {
        return res.status(400).json({ message: "Email parameter is required" });
    }
    const targetEmail = String(email).toLowerCase();
    const pool = (0, db_1.getDbConnection)();
    // Delete row from `project_members` table
    await pool.query('DELETE FROM project_members WHERE projectId = ? AND userEmail = ?', [projectId, targetEmail]);
    // Fetch updated members list
    const [updatedMemberRows] = await pool.query('SELECT userEmail FROM project_members WHERE projectId = ? AND role != "Owner"', [projectId]);
    const memberEmails = updatedMemberRows.map(r => r.userEmail);
    // Sync to projects table JSON column
    await pool.query('UPDATE projects SET members = ? WHERE id = ?', [JSON.stringify(memberEmails), projectId]);
    res.json({
        success: true,
        message: `Member ${targetEmail} removed successfully`,
        members: memberEmails
    });
});
