# Dashboard & KPI Intelligence — Module Spec

**Status:** v1 — locked April 27, 2026
**Author:** Jake (Wiks)
**Repo location:** `analyst-sharpener/docs/MODE_DASHBOARD_KPI_SPEC.md`

---

## Purpose

A new mode inside Analyst Sharpener that trains the three skills hiring managers actually test in data analyst and business analyst interviews:

1. KPI fluency by domain — knowing which metrics matter and why
2. Dashboard comprehension — reading visualizations under time pressure and naming what matters
3. Problem-to-metric reasoning — translating a business problem into a diagnostic plan
4. Insight and recommendation — turning findings into actionable, measurable recommendations

These are the skills behind every analyst case study question. Sharpener already drills SQL, Excel, Tableau, and Python. This module drills the layer above them — the analytical judgment that makes a candidate hireable at the $75K+ tier.

---

## Scope (v1)

Four modes, five domains, ~190 total content items.

### Mode 1 — KPI Library

Flashcard-style reference covering core KPIs per domain.

- 90 cards total: ~18 per domain × 5 domains
- Each card displays:
  - Metric name
  - Formula (text, no LaTeX)
  - Why it matters (one sentence)
  - Decision context (what business question it answers)
  - Common misinterpretations (1-2 typical mistakes)
  - Related role titles (which job titles use this metric most)
- Flashcard UI with reveal mechanic (similar to existing Cards mode)
- Self-grade as Strong / Partial / Weak
- Misses flow into existing Weak Queue system

### Mode 2 — Dashboard Comprehension Drill

Time-pressured visual reading under interview-like conditions.

- 25 drills total: 5 per domain
- Each drill presents a rendered dashboard (charts + numbers)
- 60-second timer
- Three questions per drill:
  - What is the story this dashboard is telling?
  - What is anomalous or unexpected?
  - What would you ask next as the analyst?
- Free-text answer
- AI-graded comparison against a strong-analyst answer
- Feedback structured into: what you caught, what you missed, what a senior would have seen

### Mode 3 — Problem-to-Metric Reasoning

Business problem in plain English; user names the diagnostic KPIs.

- 38 scenarios: 7-8 per domain
- User ranks 3-5 KPIs in priority order
- User provides one-sentence diagnostic logic per KPI
- AI grades on:
  - Coverage (did you name the right metrics)
  - Order (did you sequence them correctly — leading indicators before lagging)
  - Reasoning (does the logic hold)
- Feedback compares to how a mid-market analyst would approach it

### Mode 4 — Insight and Recommendation

Hybrid format: structured fields → free-text VP pitch.

- 32 scenarios: 6-7 per domain
- Each scenario presents a finding (e.g., "Mobile users convert 2.3x more than web, but only 18% install the app")
- Structured input fields:
  - Insight (what does this mean in business terms)
  - Recommendation (what specific action with rationale)
  - Measurement plan (how would you know it worked)
- Then one free-text field: "Pitch this to the VP of Marketing in one paragraph"
- AI grades both the structured analysis and the synthesis pitch
- Feedback focuses on the four most common junior-analyst failure modes:
  1. Stopping at description instead of prescription
  2. Recommendations that aren't actionable
  3. Missing the tradeoff or cost
  4. No measurement plan

---

## Domains

All four modes cover all five domains:

1. **Retail / E-commerce** — matches Walmart background and Shopify portfolio project
2. **Healthcare** — matches Medicare Spending portfolio project
3. **Finance** — matches S&P 500 portfolio project
4. **Operations / Supply Chain** — matches Boeing aviation background
5. **Marketing** — expands target role pool to marketing analyst, growth analyst, and DTC analytics positions

Each scenario is tagged with its domain so the user can filter and so performance tracking can show where weakness clusters.

---

## Cross-cutting requirements

### Weak Queue integration

Misses in any of the four modes flow into the existing Weak Queue. The Weak Queue treats KPI cards, dashboard drills, and scenarios as the same priority class as SQL/Excel/Tableau/Python misses. Single source of weakness truth across the whole app.

### Performance tracking

Per-domain scoring within the new module:
- Strong / Partial / Weak counts per mode per domain
- Visible in the existing All-Time Progress dashboard, broken out by domain when in this mode

### AI grading prompts

Each mode requires a carefully written grading prompt that defines what a strong-analyst answer looks like in that domain. Prompts must:
- Cite real-world business reasoning (not generic LLM-fluff)
- Distinguish junior analyst answers from senior analyst answers explicitly
- Provide actionable feedback ("you missed X because..."), not just scoring

Grading prompts are the most fragile content in this module. They will need iteration after first user testing.

### Content integrity

KPI definitions and recommendation examples must be grounded in real industry usage. During build, content will be researched via web search and cited internally during scenario generation. Healthcare and finance scenarios specifically will be human-validated before ship — wrong examples in those domains damage credibility in interviews.

---

## Build sequence

### Session 1 — Migration (COMPLETE, April 25, 2026)

- StackBlitz → Vite + React on WSL Ubuntu
- GitHub repo at `jaket050/analyst-sharpener`
- Vercel deployment with CI/CD via GitHub
- All 8 existing modes verified in production

### Session 2 (in progress, April 27, 2026)

Tonight's scope:
- Spec doc (this file) committed to repo
- Architecture scaffold — new mode tab, state slice, Weak Queue hook
- Mode 1 (KPI Library) — all 90 cards, all five domains, working end-to-end

Deferred:
- Mode 2 (Dashboard Comprehension)
- Mode 3 (Problem-to-Metric Reasoning)
- Mode 4 (Insight and Recommendation)

### Session 3 (next deep work day)

- Modes 2 and 3
- Both involve free-text AI grading; share infrastructure

### Session 4 (deep work day after)

- Mode 4 with hybrid structured/free-text grading
- Full module smoke test in production
- Resume bullet update to reflect new module

---

## Architecture decisions

### Why this is a Sharpener mode, not a separate app

Splitting would mean:
- Two deployments to maintain
- Duplicated Weak Queue logic
- Weaker portfolio story (two small projects vs. one comprehensive system)
- Loss of cross-domain weakness tracking

Single comprehensive app reads as a senior product decision in interviews.

### Why content is bundled, not API-fetched

KPI cards and scenarios are static reference content. Bundling them into the React app:
- Loads instantly with zero API cost
- Works without an API key for browsing
- Reserves the API call for what AI uniquely adds (live grading)

This is the same architectural principle behind the existing flashcard bank.

### Why no localStorage persistence (yet)

Per current Sharpener architecture (Path C from migration session), there is no persistent storage. Progress lives in React state only. This is a known limitation. Future refactor (Path B, edge function + Supabase or similar) will add persistence. Until then, sessions reset on reload.

---

## Out of scope for v1

These are good ideas that are NOT in v1:

- Multi-user accounts
- Cross-device sync of weak queue
- Custom domain pack creation by users
- Export of performance data
- Spaced repetition scheduling for KPI cards
- Video walkthroughs of dashboard drills
- Industry-specific deep dives (e.g., healthcare claims data specifics)

These all become possible after the Path B architecture refactor and a Supabase backend. Tracking here so they're not lost.

---

## Success criteria

The module is v1-complete when:

- All four modes are accessible from the Sharpener UI
- All four domains have full content coverage per mode
- AI grading returns useful feedback in each mode
- Weak Queue captures misses correctly
- Performance tracking shows per-domain scoring
- Production deployment is verified
- Content has been validated for accuracy in healthcare and finance domains

The module is portfolio-ready when:

- README on the repo describes the module's purpose and use case
- Resume bullet reflects production deployment of an interview prep system covering KPI fluency, dashboard reading, problem decomposition, and recommendation framing across four industry domains
- LinkedIn Featured section links to a live demo and the GitHub repo
