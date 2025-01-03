import { Request, Response } from 'express';
import { fetchGSocOrganizations, fetchUnassignedIssues } from '../services/gsoc';

export const getUnassignedIssues = async (req: Request, res: Response): Promise<void> => {
    try {
        const organizations = await fetchGSocOrganizations();
        const issues = await fetchUnassignedIssues(organizations);
        res.json(issues);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
