import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
    page.on('requestfailed', request => console.error('REQUEST FAILED:', request.url(), request.failure().errorText));

    console.log('Navigating to http://localhost:5174/planner...');
    try {
        await page.goto('http://localhost:5174/planner', { waitUntil: 'networkidle' });
        console.log('Page loaded! Waiting a few seconds...');
        await page.waitForTimeout(3000);
    } catch (err) {
        console.error('Failed to load page:', err);
    }

    await browser.close();
})();
