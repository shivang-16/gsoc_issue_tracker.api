"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnassignedIssues = void 0;
const env_1 = require("../config/env");
const axios_1 = __importDefault(require("axios"));
const getUnassignedIssues = async (org) => {
    try {
        const reposResponse = await axios_1.default.get(`${env_1.GITHUB_API_URL}/orgs/${org}/repos`, {
            headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
        });
        const repos = reposResponse.data;
        // console.log(repos, "here are repos");
        // Find the repository with the most open issues
        const repoWithMostOpenIssues = repos.reduce((prev, current) => {
            return (prev.open_issues > current.open_issues) ? prev : current;
        });
        // console.log(repoWithMostOpenIssues, "repo with most open issues");
        // Fetch issues for the repository with the most open issues
        const issuesResponse = await axios_1.default.get(`${env_1.GITHUB_API_URL}/repos/${org}/${repoWithMostOpenIssues.name}/issues?state=open`, { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } });
        const issues = issuesResponse.data;
        // Filter for unassigned issues
        const unassignedIssues = issues.filter((issue) => !issue.assignee);
        return unassignedIssues;
    }
    catch (error) {
        return error.message;
    }
};
exports.getUnassignedIssues = getUnassignedIssues;
