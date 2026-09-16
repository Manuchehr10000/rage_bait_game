import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1000, height: 700 } });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('http://localhost:5199/sheet.tmp.html');
await p.waitForFunction(() => window.ready === true, null, { timeout: 15000 });
await p.locator('#sheet').screenshot({ path: process.argv[2] + '/martello.png' });
await b.close();
