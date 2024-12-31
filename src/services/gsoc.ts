import { fetchIssuesForOrg } from './github';
import { scrapeOrganizations } from '../utils/scraper';
import { db } from '../db/db';
import { GITHUB_API_URL } from '../config/env';
import axios from 'axios';

// export const fetchGSoCOrganizations = async (): Promise<string[]> => {
//     // Scrape GSoC organizations
//     return scrapeOrganizations();
// };

export const fetchGSocOrganizations = async (): Promise<string[]> => {
    const organizations = await db.collection('gsoc_orgs').find().toArray();
    const orgs_github: string[] = [];
    for (const org of organizations) {
        const url = new URL(org.github);
        const orgName = url.pathname.replace(/^\/|\/$/g, '');
        console.log(orgName)
        orgs_github.push(orgName);
    }
    return orgs_github;
};

export const fetchUnassignedIssues = async (organizations: string[]): Promise<any[]> => {
    const allIssues: any[] = [];

    for (const org of organizations) {
        try {
            // Fetch repositories for the organization
            const reposResponse = await axios.get(`${GITHUB_API_URL}/orgs/${org}/repos`, {
                headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
            });
            const repos = reposResponse.data;
            console.log(repos, "here are repos");

            for (const repo of repos) {
                try {
                    // Fetch issues for the repository
                    const issuesResponse = await axios.get(
                        `${GITHUB_API_URL}/repos/${org}/${repo.name}/issues?state=open`,
                        { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } }
                    );
                    const issues = issuesResponse.data;

                    // Filter for unassigned issues
                    const unassignedIssues = issues.filter((issue: any) => !issue.assignee);

                    // Add to the list of all issues
                    allIssues.push(...unassignedIssues);
                } catch (issueError: any) {
                    console.error(`Error fetching issues for repo ${repo.name}:`, issueError.message);
                }
            }
        } catch (repoError: any) {
            console.error(`Error fetching repositories for org ${org}:`, repoError.message);
        }
    }

    return allIssues;
};