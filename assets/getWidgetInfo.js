const puppeteer = require('puppeteer');

const arg1 = process.argv[2];

// write func can be the main and the query can be change
async function execute(url) {
  let siteDown = await isSiteDown(url);
  let elementPresent = false;
  let textOk = false;

  if (siteDown === true) {
    elementPresent = false;
    textOk = false;
  }
  else {
    elementPresent = await isElementPresent(url);
  }
  if (elementPresent === true) {
    textOk = await isTextOk(url);
  }
  // current day
    const date = new Date();
    const hour = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const today = `${day}/${month}/${year}-${hour}:00`;
    let status = "ok";

    if (elementPresent === true && textOk === true && siteDown === false) {
        status = "ok";
    }
    else
        status = "error";

    let statusType = "";
    if (status === "error")
        if (siteDown === true)
            statusType = "Site-down";
        else if (elementPresent === false)
            statusType = "Widget-not-found";
        else if (textOk === false)
            statusType = "Misconfigured";

  console.log(today + " " + status + " " + statusType + " " + url + " ");
}


async function isSiteDown(url) {
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();
    const response = await page.goto(url);

    await browser.close();

    return response.status() !== 200;
}


async function isElementPresent(url, selector = "#st-faq-root", timeout = 20000) {
    let element = null;
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();

    try {
      await page.goto(url, { timeout });
      await page.waitForSelector("#st-faq", { timeout });
      element = await page.$(selector);
    }

    catch (error) {
      console.error(error);
    }

    await browser.close();

    return element !== null;
}

async function isTextOk(url, text = "Comment pouvons-nous vous aider ?", timeout = 30000) {
    let isPresent = false;
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();

    try {
        await page.goto(url, { timeout });
        // check if the text is in the page
        isPresent = await page.evaluate((text) => document.querySelector('body').innerText.includes(text), text);
    }
    catch (error) {
      console.error(error);
    }

    await browser.close();

    return isPresent;
}

execute(arg1);