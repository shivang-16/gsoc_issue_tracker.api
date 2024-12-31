import axios from 'axios';


// Fetch repositories for a given organization
export const fetchGitHubRepos = async (org: string): Promise<string[]> => {
    const url = `https://api.github.com/orgs/${org}/repos`;
    let repos: string[] = [];
    let page = 1;

    try {
        while (true) {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`,
                },
                params: {
                    per_page: 100,
                    page,
                },
            });

            const repoNames = response.data.map((repo: any) => repo.name);
            repos = repos.concat(repoNames);

            // Break if there are no more pages
            if (repoNames.length < 100) break;

            page++;
        }
    } catch (error: any) {
        console.error(`Error fetching repositories for organization ${org}:`, error.message);
        throw error;
    }

    return repos;
};

// Fetch open issues for a given repository
export const fetchGitHubIssues = async (org: string, repo: string): Promise<any[]> => {
    const url = `https://api.github.com/repos/${org}/${repo}/issues`;
    let issues: any[] = [];
    let page = 1;

    try {
        while (true) {
            const response = await axios.get(url, {
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
            if (response.data.length < 100) break;

            page++;
        }
    } catch (error: any) {
        console.error(`Error fetching issues for repository ${org}/${repo}:`, error.message);
        throw error;
    }

    return issues;
};

// Fetch all issues for all repositories in an organization
export const fetchIssuesForOrg = async (org: string): Promise<any[]> => {
    try {
        // Step 1: Fetch all repositories
        const repos = await fetchGitHubRepos(org);

        // Step 2: Fetch issues for each repository
        const allIssues = [];
        for (const repo of repos) {
            const issues = await fetchGitHubIssues(org, repo);
            allIssues.push({
                repo,
                issues,
            });
        }

        return allIssues;
    } catch (error: any) {
        console.error(`Error fetching issues for organization ${org}:`, error.message);
        throw error;
    }
};

