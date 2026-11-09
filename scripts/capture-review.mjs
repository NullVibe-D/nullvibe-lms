import { chromium } from '@playwright/test';

const browser = await chromium.launch({ executablePath: process.env.QA_BROWSER || 'C:/Users/Lenovo/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe' });
try {
  for (const width of [320, 360, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: width < 500 ? 844 : 1024 } });
    await page.goto((process.env.QA_URL || 'http://127.0.0.1:4180') + '/#/learn/N4');
    await page.getByRole('button', { name: 'Mentor', exact: true }).click();
    await page.getByRole('button', { name: 'Explain たことがある', exact: true }).click();
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: 'qa/after/06-mentor-' + width + '.png', animations: 'disabled' });
    await page.close();
  }
} finally { await browser.close(); }
