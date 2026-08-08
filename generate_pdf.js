const puppeteer = require('puppeteer');
const path = require('path');
const os = require('os');

const chromePath = path.join(os.homedir(), '.cache', 'puppeteer', 'chrome', 'win64-151.0.7922.47', 'chrome-win64', 'chrome.exe');

const inputFile = 'file:///' + path.join(os.homedir(), '.gemini', 'antigravity', 'brain', '25fc76db-3226-4223-9388-6124e25916e2', 'lattice_guard_explanation.html').replace(/\\/g, '/');
const outputFile = path.join(os.homedir(), '.gemini', 'antigravity', 'brain', '25fc76db-3226-4223-9388-6124e25916e2', 'Lattice_Guard_Full_Explanation.pdf');

(async () => {
  console.log('Chrome path:', chromePath);
  console.log('Input HTML:', inputFile);
  console.log('Output PDF:', outputFile);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  console.log('Loading page...');
  await page.goto(inputFile, { waitUntil: 'networkidle0', timeout: 60000 });
  
  // Wait for Google Fonts to load
  await new Promise(r => setTimeout(r, 4000));

  console.log('Generating PDF...');
  await page.pdf({
    path: outputFile,
    format: 'A4',
    printBackground: true,
    margin: { top: '18mm', bottom: '18mm', left: '15mm', right: '15mm' },
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:9px;color:#94a3b8;width:100%;text-align:center;font-family:sans-serif;padding-top:5px;">
      Lattice-Guard: VLSI Fault-Tolerant Monitoring Architecture — Full Explanation
    </div>`,
    footerTemplate: `<div style="font-size:9px;color:#94a3b8;width:100%;text-align:center;font-family:sans-serif;padding-bottom:5px;">
      Page <span class="pageNumber"></span> of <span class="totalPages"></span> &nbsp;|&nbsp; VLSI Secure Systems Research 2026
    </div>`
  });

  await browser.close();

  console.log('SUCCESS! PDF saved to:', outputFile);
})().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
