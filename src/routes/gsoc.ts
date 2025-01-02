import { Router } from 'express';
import { getPopularIssues, getUnassignedIssues } from '../controllers/gsoc';
import { getGsocOrganizations } from '../controllers/gsoc';

const router: Router = Router();

router.get('/orgs', getGsocOrganizations);
router.get('/issues', getUnassignedIssues);
router.get('/issues/popular', getPopularIssues);

export default router;
