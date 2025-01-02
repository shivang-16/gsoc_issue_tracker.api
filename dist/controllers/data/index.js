"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getData = void 0;
const db_1 = require("../../db/db");
const getData = async (req, res) => {
    try {
        const { type } = req.query;
        const data = await db_1.db.collection('datas').findOne({ type });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getData = getData;
