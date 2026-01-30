import { scrapeGoogleMaps } from '../src/lib/scraper/google-maps';

async function main() {
  console.log("Starting scrape test...");
  try {
    const results = await scrapeGoogleMaps("Plumbers in New York", 3);
    console.log("Scrape Results:", JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("Scrape failed:", error);
  }
}

main();
