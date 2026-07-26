# Midnight Travel Consulting — V2

A GitHub- and Cloudflare Pages-ready website for Midnight Travel Consulting.

## What changed

- Preserved the existing midnight/aviation visual direction.
- Reworked the departure-board statistics with metric-specific statuses:
  - Tracked
  - Ticketed
  - Planned
  - Invoiced
  - Redeemed
  - Assisted
- Added a split-flap-inspired number animation.
- Added a dedicated pricing page with monthly/annual switching.
- Added a volume selector that highlights the closest pricing tier.
- Added a free consultation intake page.
- Added a Cloudflare Pages Function and D1 schema to store consultation requests.
- Added `/proposal` redirects so old links continue working.
- Replaced visible bracketed About placeholders with usable interim copy.

## Site structure

```text
/
├── index.html
├── pricing/index.html
├── consultation/index.html
├── proposal/index.html
├── assets/
│   ├── styles.css
│   ├── site.js
│   ├── pricing.js
│   └── consultation.js
├── functions/api/consultation.js
├── schema.sql
├── wrangler.toml
├── _headers
├── _redirects
└── robots.txt
```

## Pricing currently included

| Tier | Monthly volume | Monthly billing | Annual billing |
|---|---:|---:|---:|
| Essential | 1–5 bookings | $450/month | $383/month, $4,590 billed annually |
| Managed | 6–15 bookings | $900/month | $765/month, $9,180 billed annually |
| Priority | 16–30 bookings | $1,600/month | $1,360/month, $16,320 billed annually |
| Custom | 31+ bookings | Custom | Custom |

Annual pricing reflects a 15% discount.

For pricing purposes, one flight booking is defined on the page as one ticketed passenger itinerary. A connecting or round-trip itinerary is not counted separately for every segment.

## Deploy through GitHub + Cloudflare Pages

### 1. Create a GitHub repository

Create a new repository, then upload everything in this folder to the repository root.

From a terminal, the commands would look like:

```bash
git init
git add .
git commit -m "Launch Midnight Travel Consulting v2"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

### 2. Connect the repository to Cloudflare Pages

In Cloudflare:

1. Open **Workers & Pages**.
2. Select **Create** and choose **Pages**.
3. Choose **Connect to Git**.
4. Select the GitHub repository.
5. Use these build settings:
   - Framework preset: `None`
   - Build command: leave blank
   - Build output directory: `.`
6. Deploy.

The `functions` directory is detected automatically by Cloudflare Pages.

## Set up the D1 intake database

The website works without D1 for browsing, but the consultation form will not save submissions until the binding is configured.

### 1. Create the database

In Cloudflare:

1. Open **Storage & Databases**.
2. Choose **D1 SQL Database**.
3. Create a database named `midnight-travel-consulting`.

### 2. Apply the schema

Open the D1 database's Console and paste the contents of `schema.sql`, or use Wrangler:

```bash
npx wrangler d1 execute midnight-travel-consulting --remote --file=schema.sql
```

### 3. Bind D1 to the Pages project

In the Cloudflare Pages project:

1. Open **Settings**.
2. Open **Bindings**.
3. Add a **D1 database binding**.
4. Variable name: `DB`
5. Select the `midnight-travel-consulting` database.
6. Redeploy the site.

The binding name must be exactly `DB` because the function uses `context.env.DB`.

## View consultation submissions

In the D1 Console, run:

```sql
SELECT
  reference,
  created_at,
  status,
  full_name,
  company,
  email,
  monthly_trips,
  monthly_passengers,
  annual_travel_spend
FROM consultation_requests
ORDER BY created_at DESC;
```

To read one complete submission:

```sql
SELECT *
FROM consultation_requests
WHERE reference = 'MTC-XXXXXXXX';
```

## Updating the site

Once Cloudflare Pages is linked to GitHub, every push to the configured production branch will automatically create a new deployment.

Typical update flow:

```bash
git add .
git commit -m "Update pricing copy"
git push
```

## Before the public launch

- Replace the monogram portrait with a real founder photo when available.
- Replace or personalize the interim About copy.
- Add the real domain in Cloudflare Pages.
- Add an email notification workflow if desired; D1 currently stores the submission but does not send an email.
- Review the final business structure, invoicing language, payment handling, disclosures, and applicable travel-selling requirements with qualified professionals.
