"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const issueController_1 = require("../controllers/issueController");
const router = (0, express_1.Router)();
router.get('/', issueController_1.getUnassignedIssues);
exports.default = router;
