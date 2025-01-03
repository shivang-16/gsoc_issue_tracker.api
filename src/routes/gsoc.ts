import { Router } from 'express';
import { getGsocOrganizationsNames, getOrganizationDetails, getPopularIssues, getUnassignedIssues } from '../controllers/gsoc';
import { getGsocOrganizations } from '../controllers/gsoc';

const router: Router = Router();

router.get('/orgs', getGsocOrganizations);
router.get('/issues', getUnassignedIssues);
router.get('/issues/popular', getPopularIssues);
router.get('/orgs/name', getGsocOrganizationsNames);
router.get('/orgs/details', getOrganizationDetails);

export default router;
