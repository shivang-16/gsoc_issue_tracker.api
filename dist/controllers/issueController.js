"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnassignedIssues = void 0;
const gsoc_1 = require("../services/gsoc");
const getUnassignedIssues = async (req, res) => {
    try {
        const organizations = await (0, gsoc_1.fetchGSocOrganizations)();
        const issues = await (0, gsoc_1.fetchUnassignedIssues)(organizations);
        res.json(issues);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUnassignedIssues = getUnassignedIssues;
