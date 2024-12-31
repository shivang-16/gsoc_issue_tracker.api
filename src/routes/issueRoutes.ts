import { Router } from 'express';
import { getUnassignedIssues } from '../controllers/issueController';

const router: Router = Router();

router.get('/', getUnassignedIssues);

export default router;
