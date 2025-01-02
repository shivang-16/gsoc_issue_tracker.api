"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchIssuesForOrg = exports.fetchGitHubIssues = exports.fetchGitHubRepos = void 0;
const axios_1 = __importDefault(require("axios"));
// Fetch repositories for a given organization
const fetchGitHubRepos = async (org) => {
    const url = `https://api.github.com/orgs/${org}/repos`;
    let repos = [];
    let page = 1;
    try {
        while (true) {
            const response = await axios_1.default.get(url, {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`,
                },
                params: {
                    per_page: 100,
                    page,
                },
            });
            const repoNames = response.data.map((repo) => repo.name);
            repos = repos.concat(repoNames);
            // Break if there are no more pages
            if (repoNames.length < 100)
                break;
            page++;
        }
    }
    catch (error) {
        console.error(`Error fetching repositories for organization ${org}:`, error.message);
        throw error;
    }
    return repos;
};
exports.fetchGitHubRepos = fetchGitHubRepos;
// Fetch open issues for a given repository
const fetchGitHubIssues = async (org, repo) => {
    const url = `https://api.github.com/repos/${org}/${repo}/issues`;
    let issues = [];
    let page = 1;
    try {
        while (true) {
            const response = await axios_1.default.get(url, {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`,
                },
                params: {
                    state: 'open',
                    per_page: 100,
                    page,
                },
            });
            issues = issues.concat(response.data);
            // Break if there are no more pages
            if (response.data.length < 100)
                break;
            page++;
        }
    }
    catch (error) {
        console.error(`Error fetching issues for repository ${org}/${repo}:`, error.message);
        throw error;
    }
    return issues;
};
exports.fetchGitHubIssues = fetchGitHubIssues;
// Fetch all issues for all repositories in an organization
const fetchIssuesForOrg = async (org) => {
    try {
        // Step 1: Fetch all repositories
        const repos = await (0, exports.fetchGitHubRepos)(org);
        // Step 2: Fetch issues for each repository
        const allIssues = [];
        for (const repo of repos) {
            const issues = await (0, exports.fetchGitHubIssues)(org, repo);
            allIssues.push({
                repo,
                issues,
            });
        }
        return allIssues;
    }
    catch (error) {
        console.error(`Error fetching issues for organization ${org}:`, error.message);
        throw error;
    }
};
exports.fetchIssuesForOrg = fetchIssuesForOrg;
