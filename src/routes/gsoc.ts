import { Router } from 'express';
import { getGsocOrganizationsNames, getPopularIssues, getUnassignedIssues } from '../controllers/gsoc';
import { getGsocOrganizations } from '../controllers/gsoc';

const router: Router = Router();

router.get('/orgs', getGsocOrganizations);
router.get('/issues', getUnassignedIssues);
router.get('/issues/popular', getPopularIssues);
router.get('/orgs/name', getGsocOrganizationsNames);

export default router;
