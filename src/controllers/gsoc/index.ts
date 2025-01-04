import { Request, Response } from 'express';
import { db } from '../../db/db';
import axios from 'axios';
import { GITHUB_API_URL } from '../../config/env';
import { getOrgName } from '../../services/gsoc';
import mongoose from 'mongoose';
import { getOrgsUnassignedIssues } from '../../services/github';

export const getGsocOrganizations = async (req: Request, res: Response): Promise<void> => {
    try {
        // Fetch filters and pagination parameters from the query
        const { top, filters } = req.query;

        // Parse filters
        const parsedFilters = filters ? JSON.parse(filters as string) : {};
        const { technologies = [], topics = [], gsoc_years = [], organization = '', page = '1', limit = '10' } = parsedFilters;

        // Build the query object
        let query: any = {};

        if (organization) {
            query.organisation = { $regex: new RegExp(organization as string, 'i') }; // Case-insensitive search
        }

        if (technologies.length > 0) {
            query.technologies = { $in: technologies }; // Use the array directly
        }
        if (topics.length > 0) {
            query.topics = { $in: topics }; // Use the array directly
        }
        if (gsoc_years.length > 0) {
            query.$or = gsoc_years.map((year: string) => ({ [`gsoc_years.${year}`]: { $exists: true } }));
        }

        // Define sorting criteria
        const sortCriteria: any = {
            followers: -1, // Sort by followers descending
            forks: -1,     // Sort by forks descending if followers are equal
        };

        // Parse pagination parameters
        const parsedPage = Math.max(parseInt(page as string, 10) || 1, 1); // Ensure page is at least 1
        const parsedLimit = Math.max(parseInt(limit as string, 10) || 10, 1); // Ensure limit is at least 1
        const skip = (parsedPage - 1) * parsedLimit;

        // Count total documents for pagination metadata
        const totalDocuments = await db.collection('gsoc_orgs').countDocuments(query);

        // Fetch filtered and paginated organizations
        const filteredOrganizations = await db.collection('gsoc_orgs')
            .find(query) // Search entire collection with the query
            .sort(sortCriteria) // Apply sorting
            .skip(skip) // Skip documents for pagination
            .limit(parsedLimit) // Limit results per page
            .toArray();

        // Calculate total pages
        const totalPages = Math.ceil(totalDocuments / parsedLimit);
        console.log(filteredOrganizations.length, 'here is the filtered organizations');

        // Return the filtered organizations with pagination metadata
        res.json({
            currentPage: parsedPage,
            totalPages,
            totalDocuments,
            organizations: filteredOrganizations,
        });
    } catch (error: any) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
};

export const getGsocOrganizationsNames = async (req: Request, res: Response): Promise<void> => {
    try {
        // Fetch filters and pagination parameters from the query
        

        // Fetch filtered and paginated organizations
        const filteredOrganizations = await db.collection('gsoc_orgs')
            .find({}) // Search entire collection with the query
            .project({ _id: 0, organisation: 1, github: 1 }) // Exclude _id field
            .toArray();

        // Return the filtered organizations with pagination metadata
        res.json({
            organizations: filteredOrganizations,
        });
    } catch (error: any) {
        console.error('Error:', error.message);
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

        // Find the repository with the most open issues
        const repoWithMostOpenIssues = repos.reduce((prev: { open_issues: number; }, current: { open_issues: number; }) => {
            return (prev.open_issues > current.open_issues) ? prev : current;
        });

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
        const { label, organizations, page = '1', limit = '25' } = req.query;
        // Parse query parameters
        const parsedPage = parseInt(page as string, 10);
        const parsedLimit = parseInt(limit as string, 10);
        const skip = (parsedPage - 1) * parsedLimit;

        const orgNames = Array.isArray(organizations) 
        ? organizations 
        : organizations && typeof organizations === 'string' 
            ? organizations.split(',').map(org => org.trim()) 
            : [];
            

        const labelString = label ? String(label) : '';

        // Step 1: Build the query
        const query: any = {};
        if (labelString) {
            query.labels = { $elemMatch: { name: { $regex: labelString, $options: 'i' } } };
        }

        if (orgNames.length > 0) {
            query.html_url = {
                $regex: `https://github.com/(${orgNames.join('|')})/`,
                $options: 'i',
            };
        }

        // Step 2: Fetch total documents count for metadata
        const totalDocuments = await db.collection('gsoc_issues').countDocuments(query);

        // Step 3: Fetch paginated issues directly from the database
        let issues = await db.collection('gsoc_issues')
            .find(query)
            .sort({ created_at: -1 }) // Sort by creation date
            .skip(skip) // Skip documents for pagination
            .limit(parsedLimit) // Limit documents for pagination
            .toArray();

        // Step 4: If no issues are found and orgNames are provided, fetch unassigned issues for each organization
        if (issues.length === 0 && orgNames.length > 0) {
            console.log("No issues found, fetching unassigned issues...");
            const unassignedIssuesPromises = orgNames.map(org => getOrgsUnassignedIssues([org]));
            const unassignedIssuesArray = await Promise.all(unassignedIssuesPromises);
            // Combine issues from all organizations
            issues = unassignedIssuesArray.flat();
        }

        // Step 5: Calculate total pages
        const totalPages = Math.ceil(totalDocuments / parsedLimit);

        // Step 6: Return the response
        res.json({
            currentPage: parsedPage,
            totalPages,
            totalDocuments,
            issues,
        });
    } catch (error: any) {
        console.error("Error fetching popular issues:", error);
        res.status(500).json({ error: error.message });
    }
};








export const getPopularIssuesAndSave = async (req: Request, res: Response): Promise<void> => {
    try {
        // Step 1: Fetch all organizations from the database
        const organizations = await db.collection('gsoc_orgs').find().toArray();

        // Step 2: Filter organizations that participated in recent years
        const recentYears = ['2024', '2023', '2022', '2021', '2020', '2019'];
        const filteredOrgs = organizations.filter(org => 
            org.gsoc_years && Object.keys(org.gsoc_years).some(year => recentYears.includes(year))
        );

        const popularIssues: any[] = [];
        const currentDate = new Date();
        const startOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        
        // Step 4: Fetch popular issues from each top organization
        for (const org of filteredOrgs) {
            try {
                const orgName = await getOrgName(org.github);
                const reposResponse = await axios.get(`${GITHUB_API_URL}/orgs/${orgName}/repos`, {
                    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
                });
                const repos = reposResponse.data.slice(0, 5);

                for (const repo of repos) {
                    try {
                        const issuesResponse = await axios.get(
                            `${GITHUB_API_URL}/repos/${orgName}/${repo.name}/issues?state=open`,
                            { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } }
                        );
                        const issues = issuesResponse.data;
                        console.log(issues.length, "here is the length");

                        for (const issue of issues) {
                            try {
                                const updatedIssue = await db.collection('gsoc_issues').updateOne(
                                    { id: issue.id },
                                    { $set: issue },
                                    { upsert: true }
                                );
                                console.log(updatedIssue.modifiedCount, "here are updated issues");
                            } catch (updateError) {
                                console.error("Error updating issue:", updateError);
                                // Continue without breaking the flow
                            }
                        }

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
                    } catch (issuesError) {
                        console.error("Error fetching issues:", issuesError);
                        // Continue to the next repository without breaking the flow
                    }
                }

                if (popularIssues.length >= 200) {
                    break;
                }
            } catch (orgError) {
                console.error("Error fetching repositories for organization:", orgError);
                // Continue to the next organization without breaking the flow
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
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const getOrganizationDetails = async (req: Request, res: Response): Promise<any> => {
    try {
        const  orgId  = req.query.orgId as string;

        if (!orgId) {
            return res.status(400).json({ error: 'Organization ID is required' });
        }

        const organizationDetails = await db.collection('gsoc_orgs').findOne({ _id: new mongoose.Types.ObjectId(orgId) });

        // console.log(organizationDetails, "here is the org details");
        if (!organizationDetails) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        res.json(organizationDetails);
    } catch (error: any) {
        console.error('Error fetching organization details:', error.message);
        res.status(500).json({ error: error.message });
    }
};

