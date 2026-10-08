"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProject = exports.deleteProject = exports.createProject = exports.getProjects = void 0;
const db_1 = require("../config/db");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getProjects = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const pool = (0, db_1.getDbConnection)();
    const [rows] = await pool.query('SELECT * FROM projects');
    const projects = rows.map((row) => ({
        ...row,
        members: row.members ? (typeof row.members === 'string' ? JSON.parse(row.members) : row.members) : []
    }));
    res.json(projects);
});
exports.createProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id, name, description, userEmail, members } = req.body;
    if (!id || !name || !userEmail) {
        return res.status(400).json({ error: "id, name, and userEmail are required" });
    }
    const pool = (0, db_1.getDbConnection)();
    if (members && Array.isArray(members) && members.length > 0) {
        for (const email of members) {
            const [userRows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
            if (userRows.length === 0) {
                return res.status(400).json({ message: `User with email "${email}" is not registered in the system.` });
            }
        }
    }
    const membersJson = members ? JSON.stringify(members) : JSON.stringify([]);
    await pool.query('INSERT INTO projects (id, name, description, userEmail, members) VALUES (?, ?, ?, ?, ?)', [id, name, description || '', userEmail, membersJson]);
    try {
        await pool.query('INSERT IGNORE INTO project_members (projectId, userEmail, role) VALUES (?, ?, ?)', [id, userEmail, 'Owner']);
    }
    catch (e) {
        console.error("Error inserting project owner to project_members", e);
    }
    res.json({ success: true, message: "Project created" });
});
exports.deleteProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const pool = (0, db_1.getDbConnection)();
    const { id } = req.params;
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    res.json({ success: true, message: "Project deleted" });
});
exports.updateProject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, description, members } = req.body;
    const pool = (0, db_1.getDbConnection)();
    const updates = [];
    const values = [];
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
                const [userRows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
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
