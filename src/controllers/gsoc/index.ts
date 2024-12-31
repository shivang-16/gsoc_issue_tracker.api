import { Request, Response } from 'express';
import { db } from '../../db/db';

export const getGsocOrganizations = async (req: Request, res: Response): Promise<void> => {
    try {
        const organizations = await db.collection('gsoc_orgs').find().toArray();
        res.json(organizations);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};