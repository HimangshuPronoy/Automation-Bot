import puppeteer from 'puppeteer';

export interface ScrapedBusiness {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  url?: string;
}

export async function scrapeGoogleMaps(query: string, limit: number = 5): Promise<ScrapedBusiness[]> {
  const browser = await puppeteer.launch({
    headless: true, // Set to false for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  
  // Set a reasonable viewport
  await page.setViewport({ width: 1366, height: 768 });

  try {
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    console.log(`Navigating to: ${searchUrl}`);
    
    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // Handle cookie consent if it appears (common in EU/others)
    // Selectors vary, this is a best-effort check
    const consentButton = await page.$('button[aria-label="Accept all"]');
    if (consentButton) {
      await consentButton.click();
      await new Promise(r => setTimeout(r, 2000));
    }

    // Selector for the scrollable feed (left sidebar)
    // This selector is tricky and changes. 
    // Usually it has role="feed"
    const feedSelector = 'div[role="feed"]';
    
    try {
      await page.waitForSelector(feedSelector, { timeout: 10000 });
    } catch (e) {
      console.error("Could not find feed selector. The page structure might have changed.");
      await browser.close();
      return [];
    }

    // Scroll to load more results
    await autoScroll(page, feedSelector, limit);

    // Extract data
    const results = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('div[role="feed"] > div'));
        
        return items.map(item => {
            const urlAnchor = item.querySelector('a');
            const url = urlAnchor?.href;
            
            // Text content of the item usually contains Name, Rating, etc.
            // We need to parse specific text nodes or aria-labels.
            // This is largely heuristic due to obfuscated classes.
            
            // Name is usually the checking ARIA label of the link or the first big text
            const name = item.querySelector('div.fontHeadlineSmall')?.textContent || 
                         item.querySelector('a')?.getAttribute('aria-label') || "";

            if (!name) return null;

            // Rating and reviews are often in aria-label of span with role="img"
            const ratingSpan = item.querySelector('span[role="img"]');
            const ratingLabel = ratingSpan?.getAttribute('aria-label') || "";
            // Example: "4.5 stars 100 Reviews"
            const ratingMatch = ratingLabel.match(/([\d\.]+) stars/);
            const reviewsMatch = ratingLabel.match(/([\d,]+) Reviews/i) || ratingLabel.match(/\(([\d,]+)\)/);

            const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
            const reviews = reviewsMatch ? parseInt(reviewsMatch[1].replace(/,/g, '')) : undefined;

            // Phone is harder to get from the list view without clicking.
            // Sometimes it's in the text.
            // For now, we return what we can get from list view.
            
            // Address is often the second line of text or inside a specific container
            const textContent = (item as HTMLElement).innerText;
            
            return {
                name,
                url,
                rating,
                reviews,
                _rawText: textContent // Temporary for debug
            };
        }).filter(item => item !== null && item.name !== "");
    });

    // Post-process results
    const businesses: ScrapedBusiness[] = results.slice(0, limit).map(r => ({
        name: r!.name,
        url: r!.url,
        rating: r!.rating,
        reviews: r!.reviews,
    }));

    // Detail scraping: Visit each result to get phone, website, etc.
    // We reuse the same page to save resources
    for (const business of businesses) {
      if (!business.url) continue;

      try {
        console.log(`Getting details for: ${business.name}`);
        await page.goto(business.url, { waitUntil: 'networkidle2', timeout: 30000 });

        const details = await page.evaluate(() => {
          let phone: string | undefined;
          let website: string | undefined;
          let address: string | undefined;

          // Helper to find button/link by data-item-id (more stable)
          const findByDataId = (idPart: string) => {
             return document.querySelector(`button[data-item-id*="${idPart}"], a[data-item-id*="${idPart}"]`);
          };

          const phoneEl = findByDataId('phone');
          if (phoneEl) {
             // Aria label usually contains "Phone: +1..." or just the number
             phone = phoneEl.getAttribute('aria-label')?.replace('Phone:', '').trim() ?? 
                     (phoneEl as HTMLElement).innerText.trim();
          }

          const websiteEl = findByDataId('authority');
          if (websiteEl) {
             // It's usually an anchor
             website = (websiteEl as HTMLAnchorElement).href;
          }

          const addressEl = findByDataId('address');
          if (addressEl) {
             address = addressEl.getAttribute('aria-label')?.replace('Address:', '').trim() ??
                       (addressEl as HTMLElement).innerText.trim();
          }

          return { phone, website, address };
        });

        if (details.phone) business.phone = details.phone;
        if (details.website) business.website = details.website;
        if (details.address) business.address = details.address;

      } catch (err) {
        console.error(`Error fetching details for ${business.name}:`, err);
      }
    }

    return businesses;

  } catch (error) {
    console.error("Error scraping Google Maps:", error);
    return [];
  } finally {
    await browser.close();
  }
}

async function autoScroll(page: any, selector: string, limit: number) {
    await page.evaluate(async (selector: string, limit: number) => {
        const wrapper = document.querySelector(selector);
        if (!wrapper) return;

        let totalHeight = 0;
        let distance = 1000;
        
        // Scroll a few times
        for(let i = 0; i < Math.ceil(limit / 2); i++) {
             wrapper.scrollBy(0, distance);
             await new Promise((resolve) => setTimeout(resolve, 1000));
             
             // Check if we have enough items
             if (wrapper.querySelectorAll('div[role="article"]').length >= limit) {
                 break;
             }
        }
    }, selector, limit);
}
