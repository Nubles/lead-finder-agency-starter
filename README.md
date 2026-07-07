# Agency Lead Finder Starter

This Apify Actor scans directory, search, and business profile pages for outreach signals that a small agency can turn into lead lists.

It extracts:

- Business or page name
- Page title and meta description
- Email addresses
- UK-style phone numbers
- Contact, quote, enquiry, booking, and appointment URLs
- Social profile URLs
- Candidate official website links
- A simple lead status: `hot`, `warm`, or `research`

## Best first use

Use it to create small sample lead lists for local agencies. Start with a narrow niche and city, for example:

- Dentists in Manchester
- Med spas in London
- Accountants in Birmingham
- Builders in Leeds

Feed the Actor search result pages, directory pages, or business profile pages. For dynamic sites such as Google Maps, use this starter to process collected profile URLs first; a browser-based source collector can be added later.

## Run locally

```bash
apify run
```

## Deploy

```bash
apify push
```

## Commercial angle

The first sellable offer is not the Actor itself. It is a weekly lead list for agencies: fresh local businesses with contact details and weak-marketing signals. Once the workflow is proven, the Actor can be published on Apify Store as a reusable data extraction tool.
