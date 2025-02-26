"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gsoc_1 = require("../controllers/gsoc");
const gsoc_2 = require("../controllers/gsoc");
const router = (0, express_1.Router)();
router.get('/orgs', gsoc_2.getGsocOrganizations);
router.get('/issues', gsoc_1.getUnassignedIssues);
router.get('/issues/popular', gsoc_1.getPopularIssues);
router.get('/orgs/name', gsoc_1.getGsocOrganizationsNames);
router.get('/orgs/details', gsoc_1.getOrganizationDetails);
exports.default = router;
