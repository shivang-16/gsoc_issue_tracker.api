import puppeteer from 'puppeteer';

export const scrapeOrganizations = async (): Promise<string[]> => {
    const url = 'https://summerofcode.withgoogle.com/archive/2024/organizations';

    try {
        // Launch the Puppeteer browser
        const browser = await puppeteer.launch({
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // Replace with your Chrome path
            headless: true,
        });
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: 'networkidle0' });

        await page.waitForSelector('.org-wrapper');

        const organizations = await page.evaluate(() => {
            const orgElements = document.querySelectorAll('.name');
            const orgNames: string[] = [];
            orgElements.forEach((element) => {
                orgNames.push(element.textContent?.trim() || '');
            });
            return orgNames;
        });

        await browser.close(); 

        console.log(`Found ${organizations.length} organizations.`, organizations);
        return organizations;
    } catch (error) {
        console.error('Error scraping the page with Puppeteer:', error);
        throw error;
    }
};
