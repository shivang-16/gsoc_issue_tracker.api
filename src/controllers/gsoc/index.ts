import { Request, Response } from 'express';
import { db } from '../../db/db';
import axios from 'axios';
import { GITHUB_API_URL } from '../../config/env';
import { getOrgName } from '../../services/gsoc';

export const getGsocOrganizations = async (req: Request, res: Response): Promise<void> => {
    try {
//         const organizations = await db.collection('gsoc_orgs').find().toArray();

//         console.log('here')
//         // Fetch details from GitHub for each organization
//         const orgDetailsPromises = organizations.map(async (org) => {
//             const orgName = await getOrgName(org.github); // Assuming you have a function to get the org name
//             const response = await axios.get(`${GITHUB_API_URL}/orgs/${orgName}`, {
//                 headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
//             });
//             const followers = response.data.followers;
//             const forks = response.data.public_repos; // Assuming forks are represented by public repos

//             // Update the organization in the database
//             await db.collection('gsoc_orgs').updateOne(
//                 { _id: org._id }, // Match the organization by its ID
//                 { $set: { followers, forks } } // Update followers and forks
//             );

//             return {
//                 ...org,
//                 followers,
//                 forks,
//             };
//         });

// // Initiate updates in the background
//         orgDetailsPromises.forEach(promise => promise.catch(console.error)); // Log any errors
        // Fetch updated organizations from the database
        const updatedOrganizations = await db.collection('gsoc_orgs').find().toArray();
        // console.log(updatedOrganizations);

        // Check if a query is present
        const { top } = req.query; // Adjust based on how you are passing the query
        let sortedOrgs;
        console.log(top, "here is top");


        if (top === 'true') {
             console.log("top");
            // Sort by followers and forks, and get the top 10
            sortedOrgs = updatedOrganizations.sort((a, b) => {
                if (b.followers !== a.followers) {
                    return b.followers - a.followers; // Sort by followers descending
                } else {
                    return b.forks - a.forks; // Sort by forks descending
                }
            }).slice(0, 10);
        } else {

            console.log("not top");
            // Sort all organizations by followers and forks
            sortedOrgs = updatedOrganizations.sort((a, b) => {
                if (b.followers !== a.followers) {
                    return b.followers - a.followers; // Sort by followers descending
                } else {
                    return b.forks - a.forks; // Sort by forks descending
                }
            });
        }

        // Return the sorted organizations
        res.json(sortedOrgs);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getUnassignedIssues = async (req: Request, res: Response): Promise<void> => {
    try {
        const org = req.query.org as string;
        const reposResponse = await axios.get(`${GITHUB_API_URL}/orgs/${org}/repos`, {
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
        const issuesResponse = await axios.get(
            `${GITHUB_API_URL}/repos/${org}/${repoWithMostOpenIssues.name}/issues?state=open`,
            { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } }
        );
        const issues = issuesResponse.data;

        // Filter for unassigned issues
        const unassignedIssues = issues.filter((issue: any) => !issue.assignee);

        // Return unassigned issues from the repository with the most open issues
        res.json(unassignedIssues);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getPopularIssues = async (req: Request, res: Response): Promise<void> => {
    try {
        const org = req.query.org as string;
        const reposResponse = await axios.get(`${GITHUB_API_URL}/orgs/${org}/repos`, {
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
        const issuesResponse = await axios.get(
            `${GITHUB_API_URL}/repos/${org}/${repoWithMostOpenIssues.name}/issues?state=open`,
            { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } }
        );
        const issues = issuesResponse.data;

        // Filter for unassigned issues
        const unassignedIssues = issues.filter((issue: any) => !issue.assignee);

        // Return unassigned issues from the repository with the most open issues
        res.json(unassignedIssues);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getPopularIssuesFromTopOrgs = async (req: Request, res: Response): Promise<void> => {
    try {
        // Step 1: Fetch all organizations from the database
        const organizations = await db.collection('gsoc_orgs').find().toArray();

        // Step 2: Filter organizations that participated in recent years
        const recentYears = ['2024'];
        const filteredOrgs = organizations.filter(org => 
            org.gsoc_years && Object.keys(org.gsoc_years).some(year => recentYears.includes(year))
        ).slice(0, 10);

        const popularIssues: any[] = [];
        const currentDate = new Date();
        const startOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        
        // Step 4: Fetch popular issues from each top organization
        for (const org of filteredOrgs) {
            const orgName = await getOrgName(org.github);
            const reposResponse = await axios.get(`${GITHUB_API_URL}/orgs/${orgName}/repos`, {
                headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
            });
            const repos = reposResponse.data.slice(0, 5);

            for (const repo of repos) {
                const issuesResponse = await axios.get(
                    `${GITHUB_API_URL}/repos/${orgName}/${repo.name}/issues?state=open`,
                    { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } }
                );
                const issues = issuesResponse.data;

                // Filter for issues with at least 4 comments and created in the last month
                const filteredIssues = issues.filter((issue: any) => 
                    issue.comments >= 4 &&
                    new Date(issue.created_at) >= startOfPreviousMonth &&
                    new Date(issue.created_at) < startOfCurrentMonth
                );

                // Add the filtered issues to the popularIssues array
                popularIssues.push(...filteredIssues);

                // Limit the number of issues to 200
                if (popularIssues.length >= 200) {
                    break;
                }
            }
            if (popularIssues.length >= 200) {
                break;
            }
        }

        // Step 5: Sort the issues by comments and then by date
        popularIssues.sort((a, b) => {
            if (b.comments !== a.comments) {
                return b.comments - a.comments; // Sort by comments descending
            } else {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // Sort by date descending
            }
        });

        // Return the popular issues
        res.json(popularIssues.slice(0, 200));
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};