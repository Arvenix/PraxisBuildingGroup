# Deployment Guide — praxisbg.com

How to put this site on GitHub, deploy it to a static host, and point
**praxisbg.com** at it from GoDaddy without breaking company email.

Read [Protecting company email](#protecting-company-email) **before** touching
DNS. It is the one step in this guide that can cause real damage.

---

## Contents

1. [What this site needs from a host](#what-this-site-needs-from-a-host)
2. [Step 1 — Push to GitHub](#step-1--push-to-github)
3. [Step 2 — Choose a host](#step-2--choose-a-host)
4. [Step 3 — Deploy](#step-3--deploy)
   - [GitHub Pages](#github-pages)
   - [Vercel](#vercel)
   - [Netlify](#netlify)
   - [Azure Static Web Apps](#azure-static-web-apps)
5. [Step 4 — Protecting company email](#protecting-company-email)
6. [Step 5 — DNS at GoDaddy](#step-5--dns-at-godaddy)
7. [Step 6 — Canonical domain and www redirect](#step-6--canonical-domain-and-www-redirect)
8. [Step 7 — SSL](#step-7--ssl)
9. [Step 8 — Verify](#step-8--verify)
10. [Ongoing deployment](#ongoing-deployment)
11. [Troubleshooting](#troubleshooting)

---

## What this site needs from a host

Very little. It is static HTML, CSS, JavaScript, fonts and images:

- Serve files from a directory root
- HTTPS with an automatically renewed certificate
- A custom apex domain (`praxisbg.com`) and a `www` subdomain
- A `www` → apex redirect
- Ideally: a custom 404 page (`404.html` is included)

No Node runtime, no PHP, no database, no build command. Every host below has a
free tier that covers this comfortably.

---

## Step 1 — Push to GitHub

The repository is `https://github.com/Arvenix/PraxisBuildingGroup`.

If the folder is not yet a git repository:

```bash
cd praxisbg
git init
git add .
git commit -m "Initial Praxis Building Group website"
git branch -M main
git remote add origin https://github.com/Arvenix/PraxisBuildingGroup.git
git push -u origin main
```

If the remote is already set (for example if this folder was prepared for you
with git initialised), just:

```bash
git push -u origin main
```

You will be asked to authenticate. Use a GitHub personal access token as the
password, or install the [GitHub CLI](https://cli.github.com/) and run
`gh auth login` first.

### Before the first push

- Confirm no secrets are staged: `git status` should show only site files
- Confirm `.gitignore` is present
- Never commit `.env`, API keys, or exported lead data

---

## Step 2 — Choose a host

| | GitHub Pages | Vercel | Netlify | Azure Static Web Apps |
|---|---|---|---|---|
| Cost for this site | Free | Free tier | Free tier | Free tier |
| Deploys from GitHub push | Yes | Yes | Yes | Yes |
| Apex domain support | Yes (A / ALIAS) | Yes | Yes | Yes (via TXT validation) |
| Automatic HTTPS | Yes | Yes | Yes | Yes |
| `www` → apex redirect | Automatic | Configurable | Configurable | Configurable |
| Serverless function for the contact form | No | Yes | Yes | Yes |
| Preview deploys for branches | No | Yes | Yes | Yes |
| Setup difficulty | Lowest | Low | Low | Moderate |

**Recommendation.** If the contact form will stay on `mailto` for now, **GitHub
Pages** is the simplest thing that works and there is nothing to manage. If you
want a real form endpoint without standing up separate infrastructure, use
**Vercel** or **Netlify** — both let you add a serverless function in the same
repository and keep the email API key in an encrypted environment variable.
Choose **Azure Static Web Apps** if Praxis already uses Azure.

You are not locked in. Moving hosts later means changing DNS records, nothing
else.

---

## Step 3 — Deploy

### GitHub Pages

1. Go to the repository → **Settings** → **Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `main`, folder `/ (root)` → **Save**
4. Wait for the first build (a minute or two). The site appears at
   `https://arvenix.github.io/PraxisBuildingGroup/`
5. Under **Custom domain**, enter `praxisbg.com` and save. GitHub writes a
   `CNAME` file into the repository — leave it there.
6. Tick **Enforce HTTPS** once the certificate is issued (this can take up to
   24 hours; the checkbox stays greyed out until then)

GitHub Pages serves `404.html` automatically for missing paths.

> **Note on the `CNAME` file.** GitHub adds it. If you later `git push` a
> version of the repository that does not contain it, the custom domain setting
> is cleared. Pull after GitHub creates it.

### Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import `Arvenix/PraxisBuildingGroup`
3. **Framework preset:** Other. **Build command:** leave empty.
   **Output directory:** leave empty (or `.`)
4. Deploy
5. **Settings** → **Domains** → add `praxisbg.com` and `www.praxisbg.com`
6. Vercel shows the exact DNS records to create. **Use the values it shows**,
   not values from a blog post — Vercel's apex IP has changed historically.

To add a form endpoint later, create `api/inquiry.js` in the repository and set
`PRAXIS.formDelivery` in `js/main.js` to
`{ mode: "endpoint", url: "/api/inquiry" }`. Put the email provider's API key in
**Settings → Environment Variables**, never in the repository.

### Netlify

1. [netlify.com](https://netlify.com) → **Add new site** → **Import an existing
   project** → GitHub → `Arvenix/PraxisBuildingGroup`
2. **Build command:** leave empty. **Publish directory:** `.`
3. Deploy
4. **Domain management** → **Add a domain** → `praxisbg.com`
5. Netlify shows the DNS records to create. Use those exact values.

Netlify offers **Netlify DNS**, which moves nameservers away from GoDaddy. It
simplifies the apex domain, but it also means **you must recreate every existing
DNS record, including all email records, in Netlify's DNS before switching
nameservers.** If you are not confident doing that, keep DNS at GoDaddy and use
Netlify's external-DNS records instead.

Netlify Forms is an alternative to a custom endpoint: add `netlify` and
`name="consultation"` attributes to the `<form>` tag and Netlify captures
submissions. That requires a small change to `js/main.js` so it does not
intercept the submit.

### Azure Static Web Apps

1. Azure Portal → **Create a resource** → **Static Web App**
2. **Deployment source:** GitHub → authorise → select
   `Arvenix/PraxisBuildingGroup`, branch `main`
3. **Build presets:** Custom. **App location:** `/`. **Api location:** empty.
   **Output location:** empty
4. Create. Azure adds a GitHub Actions workflow to the repository and deploys.
5. **Custom domains** → add `www.praxisbg.com` (CNAME validation) and then
   `praxisbg.com` (TXT validation)
6. Azure shows the exact validation token and target. Use those.

Azure is the natural choice if the contact form will be an Azure Function — add
an `api/` folder to the same repository and store secrets in Application
Settings or Key Vault.

---

## Protecting company email

**Read this before editing anything in the GoDaddy DNS panel.**

`praxisbg.com` is used for company email (`sales@` and `info@`). Email routing
lives in DNS, in the same record list you are about to edit. Deleting or
overwriting the wrong record stops mail delivery immediately, and mail sent to
the domain during the outage may bounce permanently.

### Records that must not be touched

| Type | What it does | What breaks if you remove it |
|---|---|---|
| **MX** | Points the domain at the mail servers | All incoming mail stops |
| **TXT** starting `v=spf1` | Lists who may send as your domain | Outgoing mail lands in spam or is rejected |
| **CNAME** or **TXT** for DKIM (often `selector._domainkey`, `s1._domainkey`, `google._domainkey`) | Cryptographic signing of your mail | Outgoing mail fails authentication |
| **TXT** at `_dmarc` starting `v=DMARC1` | Tells receivers how to handle failures | Authentication policy is lost |
| Provider verification TXT records (`MS=`, `google-site-verification=`, etc.) | Proves domain ownership to Microsoft, Google and others | Services may de-provision the domain |
| **SRV** records like `_autodiscover`, `_sipfederationtls` | Microsoft 365 client autoconfiguration | Outlook stops auto-configuring |
| **CNAME** `autodiscover`, `enterpriseregistration`, `lyncdiscover` | Microsoft 365 services | Various Microsoft 365 features break |

### The safe procedure

1. **Export the current zone first.** In GoDaddy: **My Products** →
   `praxisbg.com` → **DNS** → **More** (or the three-dot menu) → **Export
   Zone File**. Save it somewhere you can find it. This is your rollback.
2. **Screenshot the record list** as well. Zone exports occasionally omit
   provider-managed records.
3. **Only add or change the records this guide tells you to**: the apex `A` (or
   `ALIAS`/`ANAME`) records, the `www` `CNAME`, and any host-specific
   verification `TXT`.
4. **Do not use "delete all" or any GoDaddy prompt offering to reconfigure DNS
   for a new service.** GoDaddy sometimes offers to "set up" a domain for a
   service and replaces the whole record set when it does.
5. **After each change, test email.** Send a message to `info@praxisbg.com`
   from an outside address and confirm it arrives. Send one from
   `sales@praxisbg.com` to an outside address and confirm it is not marked spam.

### If email breaks

Re-import the exported zone file, or manually recreate the MX and TXT records
from your screenshot. Restore MX first — that recovers incoming mail. DNS
changes propagate within the TTL, usually under an hour.

---

## Step 5 — DNS at GoDaddy

**Getting to the DNS editor:** sign in at godaddy.com → **My Products** → find
`praxisbg.com` → **DNS** → **Manage DNS**.

### The two records the website needs

Every host needs the same two things, expressed slightly differently:

| Host record | Purpose |
|---|---|
| `@` (the apex, `praxisbg.com`) | Where the root domain points |
| `www` | Where `www.praxisbg.com` points |

The apex is the awkward one. DNS does not allow a `CNAME` at a zone apex
alongside other records such as `MX`, which is exactly the situation here.
Hosts solve it in one of two ways: publishing static `A` record IP addresses, or
offering an `ALIAS`/`ANAME` flattening record. GoDaddy supports `A` records at
the apex; it does not offer `ALIAS`.

### GitHub Pages

**Apex — four `A` records.** GitHub publishes static IPv4 addresses for Pages.
At the time of writing they are:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

> **Verify these before entering them.** Check GitHub's current documentation:
> *GitHub Pages → Configuring a custom domain → Configuring an apex domain*.
> These addresses have changed before and this file will not update itself.

In GoDaddy, add four records:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` | `185.199.108.153` | 1 hour |
| A | `@` | `185.199.109.153` | 1 hour |
| A | `@` | `185.199.110.153` | 1 hour |
| A | `@` | `185.199.111.153` | 1 hour |

GitHub also publishes AAAA (IPv6) addresses. Adding them is optional and
recommended; take the current values from the same GitHub documentation page.

**www — one `CNAME`:**

| Type | Name | Value | TTL |
|---|---|---|---|
| CNAME | `www` | `arvenix.github.io` | 1 hour |

Note the trailing behaviour: GoDaddy appends the dot itself. The value is the
GitHub *user* subdomain, not the repository path.

### Vercel, Netlify, Azure Static Web Apps

**Do not copy IP addresses from anywhere for these hosts, including from this
file.** Each dashboard shows the exact records for your specific project, and
those values differ per account and change over time.

The shape is always the same:

| Type | Name | Value |
|---|---|---|
| A (or ALIAS if offered) | `@` | *the IP or hostname the dashboard shows* |
| CNAME | `www` | *the hostname the dashboard shows* (e.g. `something.vercel-dns.com`, `something.netlify.app`, `something.azurestaticapps.net`) |
| TXT | *as shown* | *validation token, if the host requires one* |

Where to find them:

- **Vercel:** Project → Settings → Domains → click the domain
- **Netlify:** Site → Domain management → Domains → click the domain →
  *Check DNS configuration*
- **Azure:** Static Web App → Custom domains → click the domain

Azure apex domains require a `TXT` validation record at `@` containing a token
Azure generates. Add it, wait for validation, then add the apex record Azure
specifies.

### Removing conflicting records

GoDaddy parks new domains with a placeholder. Before adding yours, look for and
remove **only** these:

- An `A` record at `@` pointing to a GoDaddy parking IP
- A `CNAME` at `www` pointing to something like `praxisbg.com` or a GoDaddy
  parking host

Leave everything else exactly as it is. See [Protecting company
email](#protecting-company-email).

### Propagation

Changes usually take effect in minutes and are complete within a few hours.
Check with:

```bash
dig praxisbg.com A +short
dig www.praxisbg.com CNAME +short
dig praxisbg.com MX +short          # confirm email records survived
dig praxisbg.com TXT +short         # confirm SPF survived
```

Or use [dnschecker.org](https://dnschecker.org) to see propagation worldwide.

---

## Step 6 — Canonical domain and www redirect

**The canonical domain is `https://praxisbg.com`** (no `www`). Every
`<link rel="canonical">`, every Open Graph URL and every entry in `sitemap.xml`
already uses it.

`https://www.praxisbg.com` must resolve and must **301 redirect** to the apex.
Serving both without a redirect splits ranking signals between two addresses.

| Host | How to set it |
|---|---|
| GitHub Pages | Automatic. Set Custom domain to `praxisbg.com` and it redirects `www` for you |
| Vercel | Domains → set `praxisbg.com` as primary → `www.praxisbg.com` gets a redirect toggle |
| Netlify | Domain management → set `praxisbg.com` as the primary domain; Netlify redirects the alias |
| Azure SWA | Add both domains, then add a redirect rule in `staticwebapp.config.json` |

Verify:

```bash
curl -sI https://www.praxisbg.com | head -n 3
# expect: HTTP/2 301  and  location: https://praxisbg.com/
```

Also confirm HTTP redirects to HTTPS:

```bash
curl -sI http://praxisbg.com | head -n 3
```

---

## Step 7 — SSL

Every host in this guide issues and renews a free Let's Encrypt or equivalent
certificate automatically. There is nothing to buy and nothing to install.

Requirements and timing:

- DNS must resolve to the host **before** the certificate can be issued
- Issuance takes anywhere from a minute to 24 hours (GitHub Pages is the
  slowest)
- The certificate must cover both `praxisbg.com` and `www.praxisbg.com`, so add
  both domains at the host before expecting either to work over HTTPS
- Enable the host's "force HTTPS" / "enforce HTTPS" option once issued

If GoDaddy tries to sell an SSL certificate during this process, you do not need
it. It is for domains hosted on GoDaddy hosting.

Once the certificate has been stable for a week or two, consider enabling HSTS
at the host.

---

## Step 8 — Verify

After DNS has propagated:

```bash
# Site resolves and redirects correctly
curl -sI https://praxisbg.com | head -n 1            # 200
curl -sI https://www.praxisbg.com | head -n 3        # 301 to apex
curl -sI http://praxisbg.com | head -n 3             # 301 to https

# SEO files are reachable
curl -s https://praxisbg.com/robots.txt
curl -sI https://praxisbg.com/sitemap.xml | head -n 1

# 404 page works
curl -sI https://praxisbg.com/no-such-page | head -n 1   # 404

# EMAIL STILL WORKS
dig praxisbg.com MX +short
dig praxisbg.com TXT +short | grep spf
dig _dmarc.praxisbg.com TXT +short
```

Then, by hand:

- [ ] Send mail **to** `info@praxisbg.com` from an outside account, confirm
      arrival
- [ ] Send mail **from** `sales@praxisbg.com` to an outside account, confirm it
      is not in spam
- [ ] Open the site on a real phone. Test the hamburger menu, tap the phone
      number, submit the form
- [ ] Run [PageSpeed Insights](https://pagespeed.web.dev/) on the home page
- [ ] Verify the property in [Google Search
      Console](https://search.google.com/search-console) — prefer the **Domain**
      property via DNS TXT, which survives host changes — and submit
      `https://praxisbg.com/sitemap.xml`
- [ ] Test social sharing with the [Facebook Sharing
      Debugger](https://developers.facebook.com/tools/debug/) and
      [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [ ] Test structured data with the [Rich Results
      Test](https://search.google.com/test/rich-results)

---

## Ongoing deployment

Every host above redeploys automatically when you push to `main`:

```bash
git add .
git commit -m "Update kitchen remodeling FAQ"
git push
```

Live within a minute or two. Hard refresh (Ctrl/Cmd + Shift + R) if you do not
see the change, since CSS and images are cached aggressively.

For larger changes, work on a branch. Vercel, Netlify and Azure all build
preview deployments for branches and pull requests, which lets you review the
change at a temporary URL before merging.

---

## Troubleshooting

**Site shows a GoDaddy parking page.** The old parking `A` record at `@` is
still present, or DNS has not propagated. Check `dig praxisbg.com A +short`.

**`www` works but the apex does not (or vice versa).** Both domains must be
added at the host, not just in DNS. Check the host's domain settings.

**"Certificate not yet issued" or an HTTPS warning.** DNS must resolve to the
host before the certificate can be issued. Wait, then re-trigger provisioning in
the host's dashboard. GitHub Pages: untick and re-tick **Enforce HTTPS**.

**GitHub Pages shows a 404 for the whole site.** Check that Pages is set to
deploy from `main` / root, and that `index.html` is at the repository root
rather than inside a subfolder.

**Custom domain keeps clearing on GitHub Pages.** Your local repository does not
contain the `CNAME` file GitHub created. Run `git pull` and push again.

**CSS or images missing after deploy.** Almost always a path case mismatch.
Local filesystems on macOS and Windows are case-insensitive; the host is not.
`Images/Hero.WEBP` will not match `images/hero.webp`.

**Email stopped working.** Restore the exported zone file, or recreate the MX
records from your screenshot first — that restores incoming mail. Then SPF, then
DKIM and DMARC. See [Protecting company
email](#protecting-company-email).

**Form does nothing on submit.** With `mode: "mailto"` the visitor needs a
configured mail client. Check the browser console for errors, and see
*Configuring the contact form* in `README.md`.

---

© Praxis Building Group, LLC. All rights reserved.
