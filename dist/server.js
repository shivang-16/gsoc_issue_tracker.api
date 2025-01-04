"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = __importDefault(require("./db/db"));
const winstonLogger_1 = require("./utils/winstonLogger");
const PORT = process.env.PORT || 7000;
(0, db_1.default)();
// Start the server
app_1.app.listen(PORT, () => {
    winstonLogger_1.logger.info(`Server is running on http://localhost:${PORT}`);
});
