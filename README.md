# Agency Lead Finder Pro

Agency Lead Finder Pro is a powerful, high-performance web crawler designed specifically for marketing agencies, B2B sales teams, and lead generation professionals. It scans business directories, search pages, and individual company profiles to extract high-intent contact signals and qualify leads automatically.

Unlike generic crawlers, this Actor is optimized to detect "weak-marketing signals" (e.g., missing websites, lack of social presence, missing contact details) so you can pitch services where they are needed most.

---

## 🚀 Key Features

*   **Intelligent Contact Extraction:** Scrapes email addresses and phone numbers.
*   **Asset Filtering:** Built-in smart filtering to exclude false-positive emails (e.g., images, graphics, theme files).
*   **International Phone Support:** Configurable phone detection optimized for the **US, UK, Canada, Australia, or Global formats**.
*   **Call-to-Action Tracker:** Detects booking, enquiry, contact, quote, and appointment links.
*   **Social Profile Finder:** Automatically extracts Facebook, Instagram, LinkedIn, X/Twitter, and TikTok profile URLs.
*   **Lead Classification Engine:** Automatically scores and tags leads as `hot`, `warm`, or `research` based on contact density and page indicators.

---

## 📥 Input Settings

| Parameter | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| **Search or Directory URLs** (`startUrls`) | Array | List of target directories or search result URLs to scan. | *(Prefilled with Yell.com)* |
| **Target Country** (`targetCountry`) | Select | Guides the phone number parser. Options: `Global`, `US`, `UK`, `CA`, `AU`. | `Global` |
| **Max Pages** (`maxRequestsPerCrawl`) | Integer | Maximum number of directory/profile pages to scrape. | `50` |
| **Follow Useful Links** (`followLinks`) | Boolean | If enabled, crawls deep links (About, Contact, Services) on company websites. | `true` |
| **Use Apify Proxy** (`useProxy`) | Boolean | Enables proxy rotation to prevent rate limiting or IP blocks. | `false` |

---

## 📤 Output Schema

Every scraped lead includes:

```json
{
  "sourceUrl": "https://www.example.com/company-profile",
  "businessName": "Example Dental Clinic",
  "pageTitle": "Example Dental Clinic | Local Dentist Manchester",
  "description": "Offering general and cosmetic dentistry services in Manchester...",
  "emails": [
    "info@exampledental.co.uk"
  ],
  "phones": [
    "0161 496 0123"
  ],
  "contactUrls": [
    "https://www.exampledental.co.uk/book-online"
  ],
  "socialUrls": [
    "https://instagram.com/exampledental"
  ],
  "websiteCandidates": [],
  "leadStatus": "hot",
  "scrapedAt": "2026-07-07T21:46:11.000Z"
}
```

---

## 💡 Monetization & Cost

This Actor is optimized for the **Pay-Per-Result (PPR)** or **Pay-Per-Event (PPE)** store model:
*   **Suggested Pricing:** **$0.005 per lead found**.
*   **Platform usage cost:** Negligible compute consumption due to highly efficient static Cheerio parsing.

---

## 🛠️ Run Locally or Deploy

### Run Locally
```bash
apify run
```

### Deploy to Apify Console
```bash
apify push
```
