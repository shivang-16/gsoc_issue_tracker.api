import { Router } from 'express';
import { getPopularIssuesFromTopOrgs, getUnassignedIssues } from '../controllers/gsoc';
import { getGsocOrganizations } from '../controllers/gsoc';

const router: Router = Router();

router.get('/orgs', getGsocOrganizations);
router.get('/issues', getUnassignedIssues);
router.get('/issues/popular', getPopularIssuesFromTopOrgs);

export default router;
