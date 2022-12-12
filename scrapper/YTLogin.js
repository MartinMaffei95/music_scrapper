const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
require('dotenv').config();

// require executablePath from puppeteer
const { executablePath } = require('puppeteer');
const { mainModule } = require('process');

const loginWithGoogle = async (loginURL) => {
  puppeteer.use(StealthPlugin());
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: executablePath(),
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'accept-language': 'en-US,en;q=0.9,hy;q=0.8',
  });
  await page.goto(loginURL);
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', process.env.G_USER);
  await Promise.all([
    page.waitForNavigation(),
    await page.keyboard.press('Enter'),
  ]);
  await page.waitForSelector('input[type="password"]', { visible: true });
  await page.type('input[type="password"]', process.env.G_PASS);
  const res = await Promise.all([
    page.waitForFunction(() => location.href === 'https://music.youtube.com/'),
    await page.keyboard.press('Enter'),
  ]);
  // Get cookies of site
  const cookiesFromPage = await page.cookies();
  console.log(cookiesFromPage);
  fs.writeFileSync(
    './credentials.json',
    JSON.stringify(cookiesFromPage, null, 2)
  );

  await browser.close();
};

exports.loginWithGoogle = loginWithGoogle;
