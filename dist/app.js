"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const issueRoutes_1 = __importDefault(require("./routes/issueRoutes"));
const gsoc_1 = __importDefault(require("./routes/gsoc"));
const data_1 = __importDefault(require("./routes/data"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./db/db"));
// Load environment variables
(0, dotenv_1.config)({
    path: "./.env",
});
(0, db_1.default)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 7000;
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
// Routes
app.get('/', async (req, res) => {
    res.send('Server is working!');
});
app.use('/api/issues', issueRoutes_1.default);
app.use('/api/gsoc', gsoc_1.default);
app.use('/api/data', data_1.default);
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
