"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.createTask = exports.deleteList = exports.updateList = exports.createList = exports.updateBoardData = exports.getBoardData = void 0;
const db_1 = require("../config/db");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getBoardData = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const pool = (0, db_1.getDbConnection)();
    const { projectId } = req.params;
    const [listRows] = await pool.query('SELECT * FROM lists WHERE projectId = ? ORDER BY orderIndex ASC', [projectId]);
    if (listRows.length === 0) {
        return res.json([]);
    }
    const listIds = listRows.map(row => row.id);
    const [taskRows] = await pool.query('SELECT * FROM tasks WHERE listId IN (?) ORDER BY orderIndex ASC', [listIds.length > 0 ? listIds : ['placeholder']]);
    const formattedLists = listRows.map((list) => {
        const tasksForList = taskRows.filter((t) => t.listId === list.id).map((t) => ({
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
exports.updateBoardData = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { lists } = req.body;
    const pool = (0, db_1.getDbConnection)();
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
exports.createList = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { projectId, list } = req.body;
    if (!projectId || !list || !list.id || !list.title) {
        return res.status(400).json({ error: "projectId and list object required" });
    }
    const pool = (0, db_1.getDbConnection)();
    await pool.query('INSERT INTO lists (id, projectId, title) VALUES (?, ?, ?)', [list.id, projectId, list.title]);
    res.json({ success: true, message: "List created" });
});
exports.updateList = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { title, tasks } = req.body;
    const pool = (0, db_1.getDbConnection)();
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
exports.deleteList = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const pool = (0, db_1.getDbConnection)();
    const { id } = req.params;
    await pool.query('DELETE FROM lists WHERE id = ?', [id]);
    res.json({ success: true, message: "List deleted" });
});
exports.createTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { listId, task } = req.body;
    if (!listId || !task || !task.id || !task.title) {
        return res.status(400).json({ error: "listId and task object required" });
    }
    const pool = (0, db_1.getDbConnection)();
    const assigneesJson = task.assignees ? JSON.stringify(task.assignees) : '[]';
    const tagsJson = task.tags ? JSON.stringify(task.tags) : '[]';
    await pool.query('INSERT INTO tasks (id, listId, title, description, imageUrl, priority, date, assignees, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [task.id, listId, task.title, task.description || null, task.imageUrl || null, task.priority || 'Medium', task.date || null, assigneesJson, tagsJson]);
    res.json({ success: true, message: "Task created" });
});
exports.updateTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = req.body;
    const pool = (0, db_1.getDbConnection)();
    const { id } = req.params;
    const updates = [];
    const values = [];
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
exports.deleteTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const pool = (0, db_1.getDbConnection)();
    const { id } = req.params;
    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    res.json({ success: true, message: "Task deleted" });
});
