"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUnassignedIssues = exports.getOrgName = exports.fetchGSocOrganizations = void 0;
const db_1 = require("../db/db");
const env_1 = require("../config/env");
const axios_1 = __importDefault(require("axios"));
// export const fetchGSoCOrganizations = async (): Promise<string[]> => {
//     // Scrape GSoC organizations
//     return scrapeOrganizations();
// };
const fetchGSocOrganizations = async () => {
    const organizations = await db_1.db.collection('gsoc_orgs').find().toArray();
    const orgs_github = [];
    for (const org of organizations) {
        const url = new URL(org.github);
        const orgName = url.pathname.replace(/^\/|\/$/g, '');
        console.log(orgName);
        orgs_github.push(orgName);
    }
    return orgs_github;
};
exports.fetchGSocOrganizations = fetchGSocOrganizations;
const getOrgName = async (github) => {
    const url = new URL(github);
    const orgName = url.pathname.replace(/^\/|\/$/g, '');
    return orgName;
};
exports.getOrgName = getOrgName;
const fetchUnassignedIssues = async (organizations) => {
    const allIssues = [];
    for (const org of organizations) {
        try {
            // Fetch repositories for the organization
            const reposResponse = await axios_1.default.get(`${env_1.GITHUB_API_URL}/orgs/${org}/repos`, {
                headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
            });
            const repos = reposResponse.data;
            // console.log(repos, "here are repos");
            for (const repo of repos) {
                try {
                    // Fetch issues for the repository
                    const issuesResponse = await axios_1.default.get(`${env_1.GITHUB_API_URL}/repos/${org}/${repo.name}/issues?state=open`, { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } });
                    const issues = issuesResponse.data;
                    // Filter for unassigned issues
                    const unassignedIssues = issues.filter((issue) => !issue.assignee);
                    // Add to the list of all issues
                    allIssues.push(...unassignedIssues);
                }
                catch (issueError) {
                    console.error(`Error fetching issues for repo ${repo.name}:`, issueError.message);
                }
            }
        }
        catch (repoError) {
            console.error(`Error fetching repositories for org ${org}:`, repoError.message);
        }
    }
    return allIssues;
};
exports.fetchUnassignedIssues = fetchUnassignedIssues;
