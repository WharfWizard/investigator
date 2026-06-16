# Investigator™

**Investment due diligence for everyone.**  
A public-interest tool from the Academy of Life Planning.  
Seven stages of structured independent review before committing any money.

---

## What it does

- Upload a PDF prospectus or photograph a printed document — Investigator reads it and pre-fills relevant fields
- Seven-stage guided review: document basics, client classification, consent and pressure, offshore risk, automated public checks, asymmetry mapping, and consequence analysis
- One-click links to FCA Register, FCA Warning List, ScamSmart, Companies House, disqualified directors, Action Fraud, MoneySavingExpert, domain age, Financial Ombudsman, and Google warnings search — all pre-filled with the firm name
- Plain-language summary with risk score, consequence cards, and next steps
- Print or save as PDF — clean A4 layout with reference number and date
- Get SAFE signpost for anyone who has experienced financial exploitation

---

## Project structure

```
investigator/
├── api/
│   └── analyse.js          # Vercel serverless function — Anthropic API proxy
├── public/
│   ├── assets/
│   │   └── icon.png        # Investigator / Get SAFE app icon
│   ├── styles/
│   │   └── main.css        # All screen and print styles
│   ├── app.js              # Application logic
│   ├── index.html          # Main application
│   ├── about.html          # About page explainer
│   ├── terms.html          # Terms of Use
│   └── privacy.html        # Privacy Notice
├── vercel.json             # Vercel routing config
└── README.md
```

---

## Deployment: GitHub → Vercel

### 1. Create a GitHub repository

```bash
cd investigator
git init
git add .
git commit -m "Initial Investigator build"
```

Create a new repository at github.com, then:

```bash
git remote add origin https://github.com/YOUR-USERNAME/investigator.git
git branch -M main
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (use your GitHub account)
2. Click **Add New → Project**
3. Import your `investigator` repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. Click **Deploy** — do not add environment variables yet

### 3. Add your Anthropic API key

1. In Vercel, go to your project → **Settings → Environment Variables**
2. Add a new variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your Anthropic API key (starts with `sk-ant-...`)
   - **Environment:** Production, Preview, Development (tick all three)
3. Click **Save**
4. Go to **Deployments** and click **Redeploy** on your latest deployment

### 4. Verify

- Visit your Vercel URL (e.g. `https://investigator-xxx.vercel.app`)
- Upload a PDF prospectus on Stage 1 — the document analysis should run
- If the analysis returns an error, check the API key is set correctly in environment variables

---

## Local development

```bash
npm install -g vercel
cd investigator
vercel dev
```

This runs the serverless function locally. Set your API key:

```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
vercel dev
```

Visit `http://localhost:3000`

---

## Customisation

### Adding the Get SAFE URL
In `public/index.html` and `public/app.js`, replace `getsafe.org.uk` with the live URL when available.

### Updating the icon
Replace `public/assets/icon.png` with any updated version. Keep the filename the same.

### Print output
The print stylesheet in `styles/main.css` (under `@media print`) controls the A4 PDF layout. The summary section is the only content printed — all navigation, upload zones, and stage content are hidden. Text sizes are set in `pt` units to render correctly on A4.

### Risk scoring
The scoring logic is in `public/app.js` in the `riskScore()` function. Each answer carries a weight — adjust these to reflect updated guidance.

---

## Security

- The Anthropic API key is **never** sent to the client browser
- All API calls go through the Vercel serverless function at `/api/analyse`
- No user data is stored — everything runs in session memory only
- File uploads are base64-encoded in the browser and sent directly to the API — no files are stored on any server

---

## Get SAFE

Investigator™ signposts to **Get SAFE (Support After Financial Exploitation)** — a free, trauma-informed support service for people affected by investment fraud and financial harm.

Get SAFE is part of the Academy of Life Planning ecosystem.

---

## Licence

© Academy of Life Planning. Public-interest tool — not for commercial resale.  
Investigator™ is a trademark of the Academy of Life Planning.
