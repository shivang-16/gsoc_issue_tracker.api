import { Router } from 'express';
import { getUnassignedIssues } from '../controllers/issueController';
import { getGsocOrganizations } from '../controllers/gsoc';

const router: Router = Router();

router.get('/orgs', getGsocOrganizations);

export default router;
