"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPopularIssuesAndSave = exports.getPopularIssues = exports.getUnassignedIssues = exports.getGsocOrganizations = void 0;
const db_1 = require("../../db/db");
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../../config/env");
const gsoc_1 = require("../../services/gsoc");
const getGsocOrganizations = async (req, res) => {
    try {
        // Fetch filters from the query parameters
        const { top, filters } = req.query;
        console.log('Filters:', filters); // Log the filters
        // Check if filters is defined before parsing
        const parsedFilters = filters ? JSON.parse(filters) : {};
        const { technologies = [], topics = [], gsoc_years = [], organization = '' } = parsedFilters;
        // Build the query object
        let query = {};
        // Add search query if present
        if (organization) {
            query.organisation = { $regex: new RegExp(organization, 'i') }; // Case-insensitive search
        }
        if (technologies.length > 0) {
            query.technologies = { $in: technologies }; // Use the array directly
        }
        if (topics.length > 0) {
            query.topics = { $in: topics }; // Use the array directly
        }
        if (gsoc_years.length > 0) {
            query.$or = gsoc_years.map((year) => ({ [`gsoc_years.${year}`]: { $exists: true } }));
        }
        // console.log('Query:', query);
        // Define sorting criteria
        const sortCriteria = {
            followers: -1, // Sort by followers descending
            forks: -1, // Sort by forks descending if followers are equal
        };
        // Fetch filtered and sorted organizations
        const filteredOrganizations = await db_1.db.collection('gsoc_orgs')
            .find(query)
            .sort(sortCriteria)
            // .limit(top === 'true' ? 10 : 0) // Limit to top 10 if `top` is true
            .toArray();
        // console.log('Filtered Organizations:', filteredOrganizations);
        // Return the filtered organizations
        res.json(filteredOrganizations);
    }
    catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
};
exports.getGsocOrganizations = getGsocOrganizations;
const getUnassignedIssues = async (req, res) => {
    try {
        const org = req.query.org;
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
        // Return unassigned issues from the repository with the most open issues
        res.json(unassignedIssues);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUnassignedIssues = getUnassignedIssues;
const getPopularIssues = async (req, res) => {
    try {
        const { label, organizations } = req.query; // Extract label and organizations from the query
        const currentDate = new Date();
        const startOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        // Ensure organizations is an array and label is a string
        const orgNames = Array.isArray(organizations) ? organizations : organizations ? [organizations] : [];
        const labelString = label ? String(label) : '';
        // Step 1: Build the query with optional filters
        const query = {};
        console.log(organizations, 'here is the query');
        // If a label is provided, filter by label using regex
        if (labelString) {
            query.labels = { $elemMatch: { name: { $regex: labelString, $options: 'i' } } };
        }
        console.log(query, 'here is the query');
        // Step 2: Fetch issues from the database, filtering and sorting by date and comments
        const issues = await db_1.db.collection('gsoc_issues').find(query)
            .sort({ comments: -1, created_at: -1 })
            .limit(800)
            .toArray();
        // Step 3: If organizations are provided, filter issues by organization
        const orgRegex = new RegExp(orgNames.join('|'), 'i');
        const filteredIssues = orgNames.length > 0
            ? issues.filter((issue) => {
                const orgNameFromUrl = issue.html_url.split('https://github.com/')[1]?.split('/')[0];
                return orgRegex.test(orgNameFromUrl);
            })
            : issues;
        // Limit the number of issues to 200
        const popularIssues = filteredIssues.slice(0, 200);
        // Return the popular issues
        console.log(popularIssues.length, "here are popular issues");
        res.json(popularIssues);
    }
    catch (error) {
        console.error("Error fetching popular issues:", error);
        res.status(500).json({ error: error.message });
    }
};
exports.getPopularIssues = getPopularIssues;
const getPopularIssuesAndSave = async (req, res) => {
    try {
        // Step 1: Fetch all organizations from the database
        const organizations = await db_1.db.collection('gsoc_orgs').find().toArray();
        // Step 2: Filter organizations that participated in recent years
        const recentYears = ['2024', '2023', '2022', '2021', '2020', '2019'];
        const filteredOrgs = organizations.filter(org => org.gsoc_years && Object.keys(org.gsoc_years).some(year => recentYears.includes(year)));
        const popularIssues = [];
        const currentDate = new Date();
        const startOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        // Step 4: Fetch popular issues from each top organization
        for (const org of filteredOrgs) {
            try {
                const orgName = await (0, gsoc_1.getOrgName)(org.github);
                const reposResponse = await axios_1.default.get(`${env_1.GITHUB_API_URL}/orgs/${orgName}/repos`, {
                    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
                });
                const repos = reposResponse.data.slice(0, 5);
                for (const repo of repos) {
                    try {
                        const issuesResponse = await axios_1.default.get(`${env_1.GITHUB_API_URL}/repos/${orgName}/${repo.name}/issues?state=open`, { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } });
                        const issues = issuesResponse.data;
                        console.log(issues.length, "here is the length");
                        for (const issue of issues) {
                            try {
                                const updatedIssue = await db_1.db.collection('gsoc_issues').updateOne({ id: issue.id }, { $set: issue }, { upsert: true });
                                console.log(updatedIssue.modifiedCount, "here are updated issues");
                            }
                            catch (updateError) {
                                console.error("Error updating issue:", updateError);
                                // Continue without breaking the flow
                            }
                        }
                        // Filter for issues with at least 4 comments and created in the last month
                        const filteredIssues = issues.filter((issue) => issue.comments >= 4 &&
                            new Date(issue.created_at) >= startOfPreviousMonth &&
                            new Date(issue.created_at) < startOfCurrentMonth);
                        // Add the filtered issues to the popularIssues array
                        popularIssues.push(...filteredIssues);
                        // Limit the number of issues to 200
                        if (popularIssues.length >= 200) {
                            break;
                        }
                    }
                    catch (issuesError) {
                        console.error("Error fetching issues:", issuesError);
                        // Continue to the next repository without breaking the flow
                    }
                }
                if (popularIssues.length >= 200) {
                    break;
                }
            }
            catch (orgError) {
                console.error("Error fetching repositories for organization:", orgError);
                // Continue to the next organization without breaking the flow
            }
        }
        // Step 5: Sort the issues by comments and then by date
        popularIssues.sort((a, b) => {
            if (b.comments !== a.comments) {
                return b.comments - a.comments; // Sort by comments descending
            }
            else {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // Sort by date descending
            }
        });
        // Return the popular issues
        res.json(popularIssues.slice(0, 200));
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
exports.getPopularIssuesAndSave = getPopularIssuesAndSave;