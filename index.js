import {franc} from 'franc';
import puppeteer from 'puppeteer';


// Ok
const url = 'https://smart-tribune-sandbox.ovh/subdomain/hackathon-laplateforme-2023/faq-success.html';

// 404
//const url = 'https://smart-tribune-sandbox.ovh/subdomain/hackathon-laplateforme-2023/faq-site-down.html';

// Product down
//const url = 'https://smart-tribune-sandbox.ovh/subdomain/hackathon-laplateforme-2023/faq-product-down.html';

// Bad configuration
//const url = 'https://smart-tribune-sandbox.ovh/subdomain/hackathon-laplateforme-2023/faq-text-not-found.html';



// write func can be the main and the query can be change
async function write() {
  const siteDown = await isSiteDown(url);
  let elementPresent = false;
  let textOk = false;

  if (siteDown === true) {
    elementPresent = false;
    textOk = false;
  }

  else {
    elementPresent = await isElementPresent(url);
    if (elementPresent === true) {
      textOk = false;
    }
    else {
      textOk = await isTextOk(url);
    }
  }

  console.log(siteDown + " " + elementPresent + " " + textOk);
}


async function isSiteDown(url) {
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();
    const response = await page.goto(url);
    
    await browser.close();

    return response.status() !== 200;
}


async function isElementPresent(url, selector = "#st-faq-root", timeout = 30000) {
    let element = null;
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();
    
    try {
      await page.goto(url, { timeout });
      await page.waitForTimeout(1000);
      element = await page.$(selector);
    }
    
    catch (error) {
      console.error(error);
    }
  
    await browser.close();
  
    return element === null;
}


async function isTextOk(url, text = "Comment pouvons-nous vous aider ?", timeout = 30000) {
    let isPresent = false;
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();
  
    try {
      await page.goto(url, { timeout });
      await page.waitForTimeout(3000);
      isPresent = await page.evaluate((text) => {
        return document.body.innerText.includes(text);
      }, text);
  
      if (isPresent) {
        const pageText = await page.evaluate(() => document.body.innerText);
        const language = franc(pageText);
        isPresent = language === 'fra';
      }
    }
    
    catch (error) {
      console.error(error);
    }
  
    await browser.close();

    return !isPresent;
}


write();

/*

async function main() {
    if (await isSiteDown(url)) {
      return 1;
    }
    if (await isElementPresent(url)) {
        return 2;
    }
    if (await isTextOk(url) === true) {
      return 3;
    }
    else {
      return 0;
    }
}

 */

//main().then(console.log);

//isSiteDown(url).then(console.log);
//isElementPresent(url).then(console.log);
//isTextOk(url).then(console.log);