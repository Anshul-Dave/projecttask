"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
app.use(express_1.default.json({ limit: '50mb', strict: false }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const board_routes_1 = __importDefault(require("./routes/board.routes"));
const init_routes_1 = __importDefault(require("./routes/init.routes"));
const list_routes_1 = __importDefault(require("./routes/list.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const member_routes_1 = __importDefault(require("./routes/member.routes"));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/projects', project_routes_1.default);
app.use('/api/boards', board_routes_1.default);
app.use('/api/lists', list_routes_1.default);
app.use('/api/tasks', task_routes_1.default);
app.use('/api/members', member_routes_1.default);
app.use('/api/init', init_routes_1.default);
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to the Backend API' });
});
app.listen(port, () => {
    console.log(`\u26A1\uFE0F[server]: Server is running at http://localhost:${port}`);
});
