import fs from "node:fs";
import path from "node:path";

async function fetchAndRecord(domain: string, filename: string) {
  const url = `https://${domain}/robots.txt`;
  console.log(`Fetching ${url}...`);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "ScrappyBot/1.0 (+https://scrappy.in/legal/responsible-scraping)",
      },
    });
    const text = await res.text();
    const outPath = path.resolve(process.cwd(), `docs/sources/${filename}`);
    const record = `# robots.txt for ${domain}

> Fetched on ${new Date().toISOString()} via single GET request with ScrappyBot/1.0 user-agent.
> Status: HTTP ${res.status} OK (FACT)

\`\`\`
${text}
\`\`\`
`;
    fs.writeFileSync(outPath, record, "utf-8");
    console.log(`Saved: docs/sources/${filename} (${text.length} chars)`);
  } catch (err: unknown) {
    console.error(`Failed to fetch ${url}:`, (err as Error).message);
  }
}

async function main() {
  await fetchAndRecord("www.amazon.in", "amazon-in-robots.txt");
  await fetchAndRecord("www.flipkart.com", "flipkart-robots.txt");
  await fetchAndRecord("www.croma.com", "croma-robots.txt");
  await fetchAndRecord("www.reliancedigital.in", "reliancedigital-robots.txt");
}

main().catch(console.error);
