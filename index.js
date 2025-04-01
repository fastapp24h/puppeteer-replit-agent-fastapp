const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/', async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt) return res.status(400).send("Missing prompt");

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.goto("https://replit.com/~", { waitUntil: "networkidle2" });

    // Aspetta l'utente loggato: salta il login se sessione salvata
    await page.waitForSelector('button:has-text("Create")', { timeout: 60000 });
    await page.click('button:has-text("Create")');

    await page.waitForSelector("textarea", { timeout: 20000 });
    await page.type("textarea", prompt);
    await page.keyboard.press("Enter");

    await page.waitForTimeout(30000); // attesa generazione
    const finalUrl = page.url();

    await browser.close();
    return res.json({ url: finalUrl });

  } catch (err) {
    console.error("Errore:", err);
    return res.status(500).send("Errore nella generazione");
  }
});

app.listen(PORT, () => {
  console.log(`Server ascolta su porta ${PORT}`);
});
