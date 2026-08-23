# Praxis Building Group, LLC — praxisbg.com

The production website for Praxis Building Group, LLC, a Southeast Michigan
general contractor based in Highland and Ann Arbor.

Static HTML5, CSS3 and vanilla JavaScript. **No build step, no framework, no
database, no npm install.** Open `index.html` in a browser and the whole site
works. Deploy by copying the folder to any static host.

- **Canonical domain:** `https://praxisbg.com`
- **Phone:** 833-637-8466
- **Project inquiries:** sales@praxisbg.com
- **General:** info@praxisbg.com

---

## Table of contents

1. [Repository structure](#repository-structure)
2. [Running the site locally](#running-the-site-locally)
3. [Changing company information](#changing-company-information)
4. [The shared header and footer](#the-shared-header-and-footer)
5. [Design system and brand colors](#design-system-and-brand-colors)
6. [Replacing images](#replacing-images)
7. [Recommended image dimensions](#recommended-image-dimensions)
8. [Adding a service page](#adding-a-service-page)
9. [Adding a city page](#adding-a-city-page)
10. [Configuring the contact form](#configuring-the-contact-form)
11. [Configuring analytics](#configuring-analytics)
12. [Social profiles](#social-profiles)
13. [SEO reference](#seo-reference)
14. [Accessibility notes](#accessibility-notes)
15. [Performance notes](#performance-notes)
16. [Security rules](#security-rules)
17. [Deployment](#deployment)
18. [Local SEO and Google Business Profile roadmap](#local-seo-and-google-business-profile-roadmap)
19. [Content integrity rules](#content-integrity-rules)
20. [Pre launch checklist](#pre-launch-checklist)

---

## Repository structure

```text
praxisbg/
├── index.html                  Home
├── about.html                  About Praxis
├── services.html               Services index
├── projects.html               Project gallery (filterable)
├── service-areas.html          Counties, cities, permitting
├── project-planning.html       Budgets, schedule, cost drivers, FAQs
├── contact.html                Full consultation form
├── privacy-policy.html         Template, needs attorney review
├── terms-of-use.html           Template, needs attorney review
├── 404.html                    Not found page (root absolute links)
│
├── services/                   13 SEO service pages
│   ├── kitchen-remodeling.html
│   ├── bathroom-remodeling.html
│   ├── basement-remodeling.html
│   ├── whole-home-renovation.html
│   ├── home-additions.html
│   ├── roofing.html
│   ├── siding.html
│   ├── flooring.html
│   ├── electrical.html
│   ├── plumbing.html
│   ├── detached-garages.html
│   ├── general-contracting.html
│   └── new-construction.html
│
├── locations/                  Location landing pages
│   ├── highland-mi.html
│   └── ann-arbor-mi.html
│
├── css/
│   ├── styles.css              Entire design system, one file
│   └── fonts.css               @font-face declarations only
│
├── js/
│   └── main.js                 Nav, form, gallery filter, analytics events
│
├── fonts/                      Self hosted woff2 (Archivo, Inter) + OFL.txt
│
├── images/
│   ├── brand/                  Logo mark, favicons, Open Graph image
│   ├── hero/                   Page hero and CTA band backgrounds
│   ├── services/               Service card images
│   ├── projects/               Gallery images
│   ├── locations/              Location page images
│   └── *.webp                  About page imagery
│
├── favicon.ico
├── site.webmanifest
├── robots.txt
├── sitemap.xml
├── .gitignore
├── DEPLOYMENT.md               Hosting + GoDaddy DNS guide
└── README.md
```

---

## Running the site locally

The site is plain files, so any of these work:

**Simplest.** Double-click `index.html`. Everything works except that some
browsers treat `file://` strictly; if fonts or images misbehave, use a server.

**Python** (installed on macOS and most Linux):

```bash
cd praxisbg
python3 -m http.server 8000
# open http://localhost:8000
```

**Node:**

```bash
npx serve praxisbg
```

**VS Code:** install the "Live Server" extension, right click `index.html`,
choose "Open with Live Server".

---

## Changing company information

Business details appear in three places. Change all three or they will drift
apart, and NAP consistency matters for local search.

### 1. Visible page content

Phone number, emails and locations appear in the top bar, header, CTA band and
footer of **every** HTML file. Use find and replace across the whole repository:

| Find | Notes |
|---|---|
| `833-637-8466` | Display format |
| `tel:+18336378466` | Link format, must stay E.164 |
| `sales@praxisbg.com` | Project inquiries |
| `info@praxisbg.com` | General questions |
| `Highland, Michigan` | Location |
| `Ann Arbor, Michigan` | Location |

### 2. JavaScript config

`js/main.js`, the `PRAXIS` object at the top of the file, section A. This is
what the form uses when it builds an email, and what error messages quote.

### 3. Structured data

Each page carries JSON-LD in `<head>`. Search for `"telephone"` and
`"email"`. The `GeneralContractor` block repeats on most pages.

> **Do not invent a street address.** The schema deliberately uses
> `addressLocality` and `addressRegion` only. Add `streetAddress` **only** when
> a real, verifiable business address exists, and then add it everywhere at
> once.

---

## The shared header and footer

The site has no server-side includes and no build step, so the header and footer
markup is repeated in each HTML file. Both blocks are wrapped in markers:

```html
<!-- PRAXIS:HEADER:START  (identical on every page - see README) -->
...
<!-- PRAXIS:HEADER:END -->
```

The blocks are **byte-identical** across all pages at the same folder depth, so
find and replace across the repository is safe. Root-level pages use relative
paths like `href="about.html"`; pages inside `services/` and `locations/` use
`href="../about.html"`. Keep that in mind when copying a block between levels.

When you add a page to the primary navigation, update the `<ul
class="primary-nav__list">` in every file. When you add a footer link, update
the relevant `<div class="footer-col">` in every file.

### Optional helper: `tools/update-shared.py`

Doing that by hand across 25 files is the one genuinely tedious job on this
site, so there is a small optional script for it. **The site does not need it
to run, build or deploy** — delete it if you would rather use find and replace.

Edit the header or footer in **one** page, then:

```bash
cd praxisbg
python3 tools/update-shared.py            # dry run, shows what would change
python3 tools/update-shared.py --write    # apply
```

It copies only the content between the markers into every other page,
re-prefixing relative links with `../` for pages inside `services/` and
`locations/`, and it preserves each page's own `aria-current="page"` highlight.
Page content outside the markers is never touched. `404.html` is deliberately
skipped because it uses root-absolute links.

Review `git diff` afterwards, and open one root page, one `services/` page and
one `locations/` page to confirm navigation still works.

---

## Design system and brand colors

Everything visual is controlled by CSS custom properties at the top of
`css/styles.css`, under `01. DESIGN TOKENS`. The palette is drawn from the
Praxis banner artwork: charcoal navy, warm white, muted bronze.

```css
--color-ink-900: #12181d;   /* footer, deepest ground */
--color-ink-800: #1a2128;   /* header, CTA band, brand ground */
--color-gold-500: #c1954c;  /* accent rules, buttons */
--color-gold-700: #7a5716;  /* accent text on light backgrounds */
--color-paper:    #f7f5f1;  /* page background */
--color-text:     #22262a;  /* body copy */
```

Change a value there and it updates site-wide. Spacing, type scale, radii,
shadows and transitions are tokens too.

**If you change a text or background color, re-check contrast.** Every current
pair meets WCAG 2.1 AA (the lowest is 5.5:1). `--color-gold-700` exists
specifically because the brighter golds do not pass on a light background.

Typography is two families, both self hosted:

- **Archivo** for headings, navigation, buttons and labels
- **Inter** for body copy and form controls

To swap a typeface, replace the woff2 files in `fonts/`, update `css/fonts.css`,
update `--font-display` / `--font-body`, and update the two
`<link rel="preload">` tags in each page's `<head>`.

---

## Replacing images

> **Important:** every photograph currently on the site is a **placeholder**
> derived from the Praxis banner artwork, and the site says so on
> `projects.html` and on each project card. Replace them with real Praxis
> project photography as it becomes available, then remove those disclaimers.

To replace an image, **overwrite the file at the same path with the same
filename**. No HTML changes are needed. Then:

1. Update the `alt` text if the new photo shows something different. Alt text
   should describe the image, not stuff keywords.
2. Update `width` and `height` attributes if the aspect ratio changed. These
   prevent layout shift and are required for good Core Web Vitals.
3. Keep files in WebP where possible.

### Spare placeholder graphics

Three unused labelled SVG placeholders are kept in the repository so a new page
never has to ship with a broken image while you wait for photography:

| File | Size | For |
|---|---|---|
| `images/praxis-hero-placeholder.svg` | 1920 × 1000 | A new page hero |
| `images/projects/praxis-project-placeholder.svg` | 900 × 600 | A new gallery entry |
| `images/locations/praxis-location-placeholder.svg` | 1200 × 700 | A new city page |

Each renders as a dark architectural panel showing its own filename and the
recommended dimensions, so it is obvious to everyone that it is temporary.

### Service images that still need photography

Three service images are labelled SVG placeholders rather than photographs
(`praxis-service-flooring.svg`, `-electrical.svg`, `-plumbing.svg`) because the
banner artwork had no representative photo. Replace them with `.webp` files and
update the `src` in `services.html`, the matching service page, and any
location page that features that service.

---

## Recommended image dimensions

| Use | File | Dimensions | Aspect | Notes |
|---|---|---|---|---|
| Home hero | `images/hero/praxis-hero-home-exterior.webp` | 1920 × 1000 | 1.92:1 | Sits under a dark gradient; a mid-tone photo works best |
| Interior page hero | `images/hero/praxis-pagehero-*.webp` | 1600 × 520 | 3.08:1 | Heavily overlaid, detail is not critical |
| CTA band background | `images/hero/praxis-cta-framing.webp` | 1600 × 700 | 2.29:1 | Heavily overlaid |
| Service card | `images/services/*.webp` | 800 × 600 | 4:3 | Used on home, services index and location pages |
| Project gallery | `images/projects/*.webp` | 900 × 600 | 3:2 | |
| Location page | `images/locations/*.webp` | 1200 × 700 | 12:7 | |
| About rail (tall) | `images/praxis-about-framing.webp` | 1000 × 1250 | 4:5 | |
| Open Graph / social | `images/brand/praxis-og-default.jpg` | **1200 × 630** | 1.91:1 | Facebook and LinkedIn standard. Keep text away from the edges |
| Logo mark | `images/brand/praxis-logo-mark.svg` | 64 × 64 viewBox | 1:1 | Vector, scales everywhere |
| App icons | `images/brand/praxis-icon-192.png`, `-512.png` | 192, 512 | 1:1 | Referenced by `site.webmanifest` |
| Apple touch icon | `images/brand/praxis-apple-touch-icon.png` | 180 × 180 | 1:1 | |
| Favicon | `favicon.ico` | 16/32/48/64 | 1:1 | Multi-resolution ICO |

Export photographs at roughly 80–85% WebP quality. Aim to keep any single image
under 250 KB and hero images under 400 KB.

---

## Adding a service page

1. **Copy an existing page** from `services/` that is structurally closest to
   the new one, and rename it with a descriptive slug, for example
   `services/window-replacement.html`.

2. **Rewrite every section.** Do not swap keywords into copied paragraphs.
   Duplicate content across service pages is actively harmful for SEO and it is
   obvious to a reader. Each page needs its own overview, typical scope, Praxis
   approach, construction considerations, planning notes and FAQs.

3. **Update the `<head>`:**
   - `<title>` — keep it under about 60 characters
   - `<meta name="description">` — keep it under about 155 characters
   - `<link rel="canonical">` — point at the new URL
   - `og:title`, `og:description`, `og:url`, `twitter:*`

4. **Update the JSON-LD:** the `Service` block (`name`, `description`, `url`),
   the `FAQPage` block (must match the visible FAQs exactly, or remove it), and
   the `BreadcrumbList` block.

5. **Update `<body data-service="...">`** with the new slug. That attribute is
   what fires the `service_page_conversion` analytics event.

6. **Add it to the navigation dropdown** — the `<ul class="nav-dropdown__grid">`
   inside the header block, in every HTML file.

7. **Add it to the footer** service list if it belongs in the top nine.

8. **Add a card** to `services.html`, and to `index.html` if it is a major
   category.

9. **Add `<loc>` entry to `sitemap.xml`** with today's date as `lastmod`.

10. **Add related-service links** on the new page, and add links *to* the new
    page from the related pages. Internal linking is not optional.

11. **Check it on a phone**, then run the [pre launch
    checklist](#pre-launch-checklist) items that apply.

---

## Adding a city page

Location pages are the highest-risk pages on a contractor site, because thin
duplicated city pages are exactly what search engines penalise.

1. Copy `locations/highland-mi.html` or `locations/ann-arbor-mi.html`, whichever
   market is more similar, and name it `locations/{city}-mi.html`.

2. **Write genuinely local content.** Look at what the two existing pages do:
   they describe the actual housing stock, actual site conditions, actual local
   permitting paths and the project types that follow from those. A page that
   only replaces "Highland" with "Novi" is a doorway page and is worse than not
   having the page at all.

   Useful angles for a new city:
   - What eras the housing stock is from, and what those eras mean structurally
   - Lot size, access and staging constraints
   - Terrain, drainage, water table, wetlands or lake frontage
   - Well and septic versus municipal water and sewer
   - Which building department reviews it, and any extra review layers
     (historic districts, HOAs, environmental review)
   - Which project types actually come up there

3. Update `<head>`, canonical, Open Graph, and the JSON-LD `@id`, `name`,
   `address.addressLocality` and `areaServed`.

4. Update the "Nearby" tag list and the cross-link to the other location page.

5. Link the new page from `service-areas.html` (move the city out of the
   plain-text "Also Serving" tags into a linked card) and from the footer
   "Service Areas" column in every file.

6. Add it to `sitemap.xml`.

Cities the architecture is prepared for: Novi, Brighton, Milford, Commerce
Township, White Lake, Bloomfield Hills, West Bloomfield, Birmingham,
Northville, Plymouth, Canton, Saline, Dexter, Chelsea, Ypsilanti.

---

## Configuring the contact form

The form appears on `contact.html` and inside the CTA band at the bottom of
every major page. All of them share the same behavior in `js/main.js`.

### Current default: `mailto`

Out of the box, `PRAXIS.formDelivery.mode` is `"mailto"`. On submit, the form
validates, then opens the visitor's email client with the inquiry pre-written to
`sales@praxisbg.com`. This requires no backend and no secrets, and it means no
lead is silently lost before a backend exists. It is not ideal — some visitors
have no mail client configured — so move to a real endpoint when you can.

### Switching to a backend

Edit section A of `js/main.js`:

```js
formDelivery: {
  mode: "endpoint",                                  // or "formspree"
  url: "https://your-endpoint.example.com/api/inquiry",
  timeoutMs: 15000
}
```

**`mode: "endpoint"`** POSTs `application/json`. The body contains:

```json
{
  "firstName": "", "lastName": "", "email": "", "phone": "",
  "projectAddress": "", "city": "", "projectType": "", "budget": "",
  "timeline": "", "message": "", "contactMethod": "", "consent": "yes",
  "pageUrl": "", "pageTitle": "", "submittedAt": "2026-01-01T00:00:00.000Z"
}
```

Return any 2xx status for success. Anything else shows the visitor an error
that tells them to call or email instead.

**`mode: "formspree"`** POSTs the raw `FormData` to a Formspree form URL with
`Accept: application/json`. Set `url` to your form endpoint.

### Where to put secrets

**Never in this repository.** `js/main.js` ships to the browser; anything in it
is public. API keys, SMTP credentials and CRM tokens belong in the environment
of whatever service sits behind `url`:

| Host | Where secrets go |
|---|---|
| Azure Functions | Application settings, or Key Vault references |
| Vercel | Project → Settings → Environment Variables |
| Netlify | Site configuration → Environment variables |
| Cloudflare Workers | Worker → Settings → Variables (encrypted) |
| AWS Lambda | Lambda environment variables, or Secrets Manager |

A minimal endpoint should: verify the request origin, re-validate the fields,
apply its own rate limiting, send the email (Resend, SendGrid, Postmark, SES),
and return 200. Enable CORS for `https://praxisbg.com` and
`https://www.praxisbg.com` only.

### Spam prevention already in place

1. **Honeypot** — a hidden `praxis_company_website` field. If it is filled, the
   submission is dropped silently.
2. **Time trap** — submissions faster than `PRAXIS.minFillSeconds` (3 seconds
   after page load) are rejected with a polite message.

Both are client side, so they stop naive bots, not determined ones. When you add
a backend, add server-side validation and rate limiting there too. If spam
becomes a real problem, add a CAPTCHA (Cloudflare Turnstile and hCaptcha are the
least intrusive) — but try the current traps first, because CAPTCHAs measurably
reduce legitimate lead volume.

---

## Configuring analytics

**No tracking IDs exist anywhere in this repository.** Every page `<head>`
contains a single commented block listing what to install and which placeholder
tokens to replace:

| Platform | Placeholder |
|---|---|
| Google Tag Manager | `GTM-XXXXXXX` |
| Google Analytics 4 | `G-XXXXXXXXXX` |
| Google Ads conversion | `AW-XXXXXXXXX` |
| Meta Pixel | `000000000000000` |
| Search Console | `PASTE-VERIFICATION-TOKEN` |

**Recommended: install Google Tag Manager only**, then add GA4, Google Ads and
Meta Pixel as tags inside GTM. One script in the page, everything else managed
without touching the code again.

### Conversion events already wired

`js/main.js` pushes these to both `window.dataLayer` and `gtag()` as soon as any
tag is present. Nothing else needs to be coded:

| Event | Fires when |
|---|---|
| `phone_click` | Any `tel:` link is clicked. Includes `link_location`: header, footer or body |
| `email_click` | Any `mailto:` link is clicked |
| `consultation_click` | Any element with `data-cta` is clicked. Includes `cta_label` |
| `consultation_submit` | A consultation form passes validation and submits. Includes `project_type` |
| `service_page_conversion` | Once per service page view. Includes `service` slug |

In GA4, mark `consultation_submit` and `phone_click` as key events. In Google
Ads, import them as conversions. For Meta, `phone_click` and `email_click` map
to `Contact`, and `consultation_submit` maps to `Lead`.

### Search Console

Verify by DNS TXT record if possible — it survives host changes. See
`DEPLOYMENT.md`. Submit `https://praxisbg.com/sitemap.xml` after verification.

---

## Social profiles

**Social icons and links are deliberately absent from the site.** There is a
comment marking the spot in the footer of every page.

Add them only once real profile URLs exist. When you do:

1. Add the links in the footer `Service Areas` column comment location, in every
   HTML file.
2. Add a `sameAs` array to the `GeneralContractor` JSON-LD on every page:

```json
"sameAs": [
  "https://www.facebook.com/YOURPAGE",
  "https://www.instagram.com/YOURPAGE",
  "https://www.linkedin.com/company/YOURPAGE",
  "https://www.google.com/maps/place/YOURPROFILE"
]
```

`sameAs` is one of the stronger signals tying a website to a Google Business
Profile, so it is worth adding as soon as the profiles are live.

Open Graph is already configured on every page and uses
`images/brand/praxis-og-default.jpg` at 1200 × 630. To give a specific page its
own share image, change `og:image` and `twitter:image` in that page's `<head>`.

---

## SEO reference

Already implemented on every page:

- Unique `<title>` and `<meta name="description">`
- Self-referencing `<link rel="canonical">` pointing at `https://praxisbg.com`
- Semantic HTML5: `header`, `nav`, `main`, `section`, `article`, `aside`,
  `footer`
- One `<h1>` per page, no skipped heading levels
- Descriptive alt text on every image
- Breadcrumbs, visible and as `BreadcrumbList` JSON-LD
- Open Graph and Twitter/X card metadata
- `sitemap.xml` and `robots.txt`
- Internal links between related services, locations and planning content

Structured data by page type:

| Page | Schema types |
|---|---|
| Home | `GeneralContractor` + `HomeAndConstructionBusiness`, `WebSite` |
| Services index | Business, `ItemList` of all services, `BreadcrumbList` |
| Service pages | Business, `Service`, `FAQPage`, `BreadcrumbList` |
| Location pages | Location-scoped business with `parentOrganization`, `FAQPage`, `BreadcrumbList` |
| Contact | Business, `ContactPage`, `BreadcrumbList` |
| Project planning | Business, `FAQPage`, `BreadcrumbList` |

**Never add `AggregateRating` or `Review` schema unless the reviews are real
and displayed on the page.** Fabricated review markup is a manual-action
offence and can remove the site from search results entirely.

Validate changes with the [Rich Results
Test](https://search.google.com/test/rich-results) and
[Schema Markup Validator](https://validator.schema.org/).

Primary keyword themes, used naturally rather than stuffed: Michigan general
contractor, Southeast Michigan general contractor, Michigan remodeling
contractor, Highland Michigan contractor, Ann Arbor contractor, home remodeling
Michigan, kitchen remodeling Michigan, bathroom remodeling Michigan, basement
remodeling Michigan, whole home renovation Michigan, home additions Michigan,
roofing contractor Michigan, new home construction Michigan.

---

## Accessibility notes

Targets WCAG 2.1 AA.

- Skip link to `#main` as the first focusable element on every page
- Visible 3px focus ring on every interactive element, brightened on dark grounds
- Mobile drawer traps focus while open, closes on Escape, returns focus to the
  toggle
- Services dropdown works by click and keyboard, not hover alone
- Every form control has a real `<label>`; errors use `role="alert"` and
  `aria-invalid`
- FAQ accordions are native `<details>` / `<summary>` and work without
  JavaScript
- Gallery filter announces result counts through an `aria-live` region
- All text meets AA contrast; the lowest current pair is 5.5:1
- Touch targets are at least 44 × 44 px
- `prefers-reduced-motion` disables transitions and smooth scrolling

When editing, the two easiest things to break are contrast (see [Design
system](#design-system-and-brand-colors)) and heading order. Do not jump from
`h1` to `h3`.

---

## Performance notes

- Two CSS files and one 15 KB JavaScript file, all first-party
- Fonts self hosted as woff2, latin subset preloaded, `font-display: swap`
- Every image has explicit `width` and `height`, so there is no layout shift
- Hero and page-hero images use `fetchpriority="high"`; everything below the
  fold uses `loading="lazy" decoding="async"`
- Photography is WebP
- `main.js` is deferred and does nothing until `DOMContentLoaded`
- No jQuery, no Bootstrap, no icon font, no third-party requests at all

Keep it that way. Every library added to this site is a Core Web Vitals
regression and a maintenance cost. If something needs a library, ask first
whether 30 lines of vanilla JavaScript would do it.

Test with [PageSpeed Insights](https://pagespeed.web.dev/) after deploying, not
locally — local results are not representative.

---

## Security rules

Non-negotiable, because this repository is intended for GitHub:

- **Never commit** `.env` files, API keys, SMTP passwords, CRM tokens, private
  keys, or customer information. `.gitignore` covers the common cases but it is
  not a substitute for attention.
- **Never put a secret in `js/main.js`** or any other client file. It ships to
  every visitor.
- **Never commit exported form submissions or lead lists.** They contain
  personal information.
- If a secret is ever committed, rotate it immediately. Removing it in a later
  commit does not remove it from history.
- Keep the site on HTTPS with HSTS once the certificate is stable.
- Add a Content Security Policy header at the host once analytics tags are
  finalised, since the tag list determines what the policy must allow.

---

## Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the full guide, including:

- Pushing this repository to GitHub
- Deploying to GitHub Pages, Vercel, Netlify or Azure Static Web Apps
- Connecting `praxisbg.com` at GoDaddy, with the exact record types each host
  needs
- Redirecting `www` to the canonical apex domain
- SSL certificate provisioning
- **Protecting company email (MX, SPF, DKIM, DMARC) while changing DNS**

Short version: this is a folder of static files. Any static host will serve it.

---

## Local SEO and Google Business Profile roadmap

The site is built to support local search, but the site is only part of it.
Roughly in priority order:

**1. Claim and complete a Google Business Profile.** This is the single highest
impact action available, ahead of anything on the website. Use the exact name
`Praxis Building Group, LLC`, the exact phone `833-637-8466`, and
`https://praxisbg.com` as the website. Select `General Contractor` as the
primary category, and add secondary categories that match real services
(Kitchen Remodeler, Bathroom Remodeler, Roofing Contractor, Home Builder).

**2. Decide on service-area versus storefront.** A contractor without a public
office should configure the profile as a service-area business and hide the
address rather than publishing a home address. Set the service area to the
communities Praxis actually covers.

**3. Two locations, later.** Google allows separate profiles for Highland and
Ann Arbor only if each is a genuinely distinct, staffed location. If both are
legitimate, point each profile at its matching location page
(`/locations/highland-mi.html`, `/locations/ann-arbor-mi.html`) rather than both
at the home page. Duplicate profiles for one location get suspended.

**4. Keep NAP identical everywhere.** Website, Google, Bing Places, Apple
Business Connect, Facebook, directories, invoices, truck lettering. Formatting
differences ("LLC" versus "L.L.C.", "833.637.8466" versus "833-637-8466") weaken
the signal.

**5. Build citations** on the directories that matter for contractors: Bing
Places, Apple Business Connect, Yelp, Angi, Houzz, Better Business Bureau,
Nextdoor, Porch, HomeAdvisor, plus local chambers of commerce in Highland,
Milford and Ann Arbor.

**6. Ask for reviews, and never fabricate them.** Ask every satisfied client, in
person at closeout, then follow up with a direct link. Respond to all reviews.
When real reviews exist, they can be displayed on the site with `Review` /
`AggregateRating` schema — but only real ones, and only when displayed.

**7. Add city pages as demand justifies them.** Publish two or three genuinely
useful city pages rather than fifteen thin ones. See [Adding a city
page](#adding-a-city-page).

**8. Add real project photography with location context.** Once real projects
can be shown, each becomes a candidate for a project detail page with genuine
local relevance — the strongest local content a contractor can produce.

**9. Post to the Google Business Profile.** Project photos, seasonal notes,
service reminders. Activity is a ranking factor and it is free.

**10. Earn local links.** Suppliers, trade partners, subcontractor websites,
chambers of commerce, local sponsorships, and local press are all realistic
sources for a contractor.

---

## Content integrity rules

These are not stylistic preferences. Breaking them creates legal and search
exposure.

**Never publish on this site without verified facts behind it:**

- Customer reviews, testimonials or star ratings
- Awards, certifications, licenses or insurance claims
- Project counts, years in business or employee counts
- Financing programs
- Guarantees or warranty terms
- Manufacturer relationships or trade affiliations
- BBB ratings
- A physical street address

Everything currently on the site is either supplied by Praxis, a general
statement about construction practice, or a clearly labelled placeholder.

**Current placeholders that need replacing before or shortly after launch:**

| What | Where |
|---|---|
| All project photography | `images/projects/`, `images/services/`, `images/hero/` |
| Placeholder disclaimers | `projects.html`, home gallery cards |
| Three SVG service images | `images/services/praxis-service-{flooring,electrical,plumbing}.svg` |
| Privacy Policy bracketed sections | `privacy-policy.html` |
| Terms of Use bracketed sections | `terms-of-use.html` |
| Analytics tokens | Commented block in every `<head>` |
| Social profile URLs | Footer comment in every file |

Writing style, for anyone adding copy: direct, specific, practical. Explain
construction clearly without talking down. No "quality you can trust", no "your
dream, our passion", no em dashes, no filler.

---

## Pre launch checklist

Content and legal:

- [ ] Attorney has reviewed `privacy-policy.html` and `terms-of-use.html`, and
      every `[BRACKETED]` section is resolved
- [ ] Effective dates set on both legal pages
- [ ] No fabricated claims anywhere (see [Content
      integrity](#content-integrity-rules))
- [ ] Real project photography in place, or the placeholder disclaimers left
      honestly in place

Technical:

- [ ] All 25 pages load with no console errors
- [ ] Every internal link resolves (no 404s)
- [ ] Mobile navigation opens, closes on Escape, and traps focus
- [ ] Services dropdown works by mouse and by keyboard
- [ ] Contact form validates, shows errors, and shows the success state
- [ ] Form delivery is configured and a real test submission was received
- [ ] Phone links dial on a real phone; email links open a mail client
- [ ] No horizontal scrolling at 320, 375, 768, 1024, 1440 and 1920 px
- [ ] Favicon and Open Graph image render correctly

SEO and analytics:

- [ ] Every page has a unique title and description
- [ ] Canonical URLs all point at `https://praxisbg.com`
- [ ] `sitemap.xml` lists every page and `lastmod` dates are current
- [ ] `robots.txt` allows crawling (and does **not** if this is a staging copy)
- [ ] Structured data passes the Rich Results Test
- [ ] Analytics tags installed and firing
- [ ] Search Console verified and sitemap submitted

Domain and hosting (see `DEPLOYMENT.md`):

- [ ] `https://praxisbg.com` and `https://www.praxisbg.com` both resolve
- [ ] `www` redirects to the apex domain
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate valid
- [ ] **Company email still works** — send and receive a test message after
      every DNS change

---

© Praxis Building Group, LLC. All rights reserved.
