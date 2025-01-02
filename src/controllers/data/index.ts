import { Request, Response } from "express";
import { db } from "../../db/db";

export const getData = async (req: Request, res: Response): Promise<void> => {
    try {
        const { type } = req.query;
        const data = await db.collection('datas').findOne({ type });
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};