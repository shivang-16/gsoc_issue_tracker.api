"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let db;
const ConnectToDB = async () => {
    const DatabaseUrl = process.env.DB_URL;
    console.log(DatabaseUrl, "here is the database url");
    try {
        await mongoose_1.default.connect(DatabaseUrl);
        exports.db = db = mongoose_1.default.connection;
        console.log("DB Connected.");
    }
    catch (error) {
        console.log("Error connecting to databases:", error);
    }
};
exports.default = ConnectToDB;
