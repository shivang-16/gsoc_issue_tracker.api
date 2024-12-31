import { fetchIssuesForOrg } from './github';
import { scrapeOrganizations } from '../utils/scraper';

export const fetchGSoCOrganizations = async (): Promise<string[]> => {
    // Scrape GSoC organizations
    return scrapeOrganizations();
};

export const fetchUnassignedIssues = async (organizations: string[]): Promise<any[]> => {
    const allIssues: any[] = [];
    for (const org of organizations) {
        const issues = await fetchIssuesForOrg(org);
        const unassignedIssues = issues.filter(issue => !issue.assignee);
        allIssues.push(...unassignedIssues);
    }
    return allIssues;
};
