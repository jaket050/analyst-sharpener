# Analyst Sharpener — Full Product Roadmap

**Status:** v1 complete (May 9, 2026) · v2 in active build
**Author:** Jake (Wiks)
**Repo:** `analyst-sharpener/docs/ROADMAP.md`

---

## Vision

The most comprehensive DA interview prep system available — training every skill layer an analyst needs from entry-level to FAANG-level, across all major domains, with AI grading calibrated to senior-analyst standards.

**Design principle:** If Sharpener prepares a candidate for FAANG, it overprepares them for every role below that bar.

---

## v1 — Complete (May 2026)

### Intel Module — 4 modes, 5 domains, 185 practice items

| Mode | Content | Status |
|------|---------|--------|
| 📖 KPI Library | 90 cards × 5 domains | ✅ Live |
| 📊 Dashboard Drill | 25 drills × 5 domains | ✅ Live |
| 🧩 Problem to Metric | 38 scenarios × 5 domains | ✅ Live |
| 💡 Insight & Rec | 32 scenarios × 5 domains | ✅ Live |

### Domains covered in v1
1. Retail / E-commerce
2. Healthcare
3. Finance
4. Operations / Supply Chain
5. Marketing

### Tool modes (existing)
- SQL Prep — core SQL patterns with AI grading
- Cards — flashcard-style concept review
- Code — coding practice
- Fire — quick-fire recall
- Drill — focused weak-area practice
- Coach — conversational AI coaching
- Domain Packs — Boeing/Aviation, Retail/Operations, Healthcare/MSPB

---

## v2 Roadmap — 13 Sessions

### Phase 1 — Core Interview Readiness

---

#### Session 6 — Product Analytics Domain
**Priority:** Highest. Most DA roles now include product analytics components.
**Status:** 🔲 Not started

**What gets built:** Product Analytics as 6th domain across all 4 Intel modes

**KPI Library additions (18 cards):**
- DAU (Daily Active Users)
- MAU (Monthly Active Users)
- DAU/MAU Ratio (Stickiness)
- D1 / D7 / D30 Retention Rate
- Feature Adoption Rate
- Session Length
- Session Frequency
- Core Action Completion Rate
- Notification Opt-in Rate
- Time to Value (TTV)
- User Activation Rate
- Engagement Score
- Monthly Active Creator Rate
- K-Factor (Virality Coefficient)
- Support Ticket Rate
- Churn Prediction Score
- LTV by Acquisition Cohort (product context)
- NPS (product context)

**Dashboard Drills additions (5 drills):**
1. Product health dashboard (DAU/retention combo with anomaly)
2. Feature launch tracker (adoption curve vs benchmark)
3. Retention cohort heatmap (day-over-day cohort grid)
4. Growth accounting (new/retained/resurrected/churned users)
5. Engagement funnel (activation → habit → advocacy)

**Problem-to-Metric additions (8 scenarios):**
1. DAU dropped 15% last Tuesday — diagnose
2. Feature adoption flat after 60 days
3. Retention cliff at Day 7
4. Notification opt-out spike
5. New market expansion — what do you measure
6. Identify power users from behavioral data
7. Churn prediction — what signals matter
8. Content quality measurement — no ground truth

**Insight & Rec additions (7 scenarios):**
1. Feature at 12% adoption after 60 days
2. D7 retention dropped 8pp after redesign
3. DAU growing but stickiness declining
4. New user activation rate below benchmark
5. Top 10% of users generating 80% of engagement
6. Push notification CTR declining
7. K-factor below 1.0

**Architecture:** Content only, no new components needed.

---

#### Session 7 — A/B Testing & Experimentation Mode
**Priority:** High. Universal FAANG test; increasingly common at $75K+ roles.
**Status:** 🔲 Not started

**What gets built:** New "🧪 A/B Test" sub-mode under Intel

**Format:**
- Experiment results presented: treatment/control sample sizes, conversion rates, p-value, confidence interval, duration, segment breakdown
- User makes ship/no-ship decision + written reasoning
- AI grades on 5 dimensions

**AI grading dimensions:**
1. Statistical validity (checked significance before deciding)
2. Practical significance (effect size meaningful even if p < 0.05)
3. Segment analysis (checked for heterogeneous treatment effects)
4. Threat identification (novelty effect, network effects, sample ratio mismatch, peeking)
5. Ship recommendation quality (clear, actionable, names tradeoff and monitoring plan)

**Content:** 20 scenarios across all 6 domains (3-4 per domain)
**Architecture:** New component, same grading pattern as Mode 4.

---

#### Session 8 — Behavioral Interview Prep with STAR Grading
**Priority:** High. Near-universal in DA interviews at all levels.
**Status:** 🔲 Not started

**What gets built:** Replaces or extends current Sim mode with structured STAR grading

**Format:**
- Behavioral question presented ("Tell me about a time you found an error in your analysis before it went to leadership")
- User writes response in free text
- AI grades on 4 STAR dimensions

**AI grading dimensions:**
1. Situation clarity (was the context concise and relevant)
2. Task specificity (was your role clearly defined)
3. Action detail (were your specific actions described, not just outcomes)
4. Result quantification (was the outcome measurable and attributed to your actions)

**Content:** 30 behavioral questions across 6 categories:
- Analytical mistakes and error handling
- Stakeholder disagreement and influence
- Ambiguous data and judgment calls
- Cross-functional collaboration
- Prioritization under constraints
- Initiative and self-direction

**Architecture:** New component or Sim mode extension.

---

#### Session 9 — Data Quality & Validation Scenarios
**Priority:** High. Heavily tested, rarely practiced.
**Status:** 🔲 Not started

**What gets built:** New "🔍 Data Quality" sub-mode under Intel

**Format:**
- Data anomaly presented (duplicate records, null values, metric definition mismatch, timestamp issues, sudden spike with no cause)
- User diagnoses the problem AND writes the communication (to manager, to stakeholder)
- AI grades on diagnosis accuracy and communication quality

**Content:** 25 scenarios across 6 domains
**Architecture:** New component, hybrid format (diagnosis + communication).

---

### Phase 2 — Senior Analyst Differentiation

---

#### Session 10 — Metric Design Mode
**Priority:** Medium-high. Universal FAANG question; increasingly tested at senior DA roles.
**Status:** 🔲 Not started

**What gets built:** New "📐 Metric Design" sub-mode under Intel

**Format:**
- "How would you measure the success of X?" scenario
- Structured fields: north star metric, 2-3 supporting metrics, 2 guardrail metrics, 1 counter-metric, harm detection approach
- AI grades on framework completeness and domain appropriateness

**AI grading dimensions:**
1. North star quality (measures what actually matters)
2. Guardrail coverage (protects against unintended side effects)
3. Counter-metric presence (names what shouldn't move negatively)
4. Harm detection (identifies ways metric could be gamed or mislead)

**Content:** 30 scenarios across 6 domains (5 per domain)
**Architecture:** New component, structured fields similar to Mode 4.

---

#### Session 11 — Stakeholder Communication Mode
**Priority:** Medium. Differentiates $55K reporting analysts from $85K business analysts.
**Status:** 🔲 Not started

**What gets built:** New "📣 Stakeholder Comm" sub-mode under Intel

**Format:**
- Technical finding presented
- Three communication tasks: Slack to manager, executive summary for VP, one-line for CEO
- AI grades on clarity, appropriate detail level, absence of jargon, action orientation

**Content:** 25 scenarios across 6 domains
**Architecture:** New component, three-field structured format.

---

#### Session 12 — Business Case & ROI Framing Mode
**Priority:** Medium. Required for senior DA roles; differentiates analysts who get promoted.
**Status:** 🔲 Not started

**What gets built:** New "💼 Business Case" sub-mode under Intel

**Format:**
- Data initiative presented ("Should we build a churn prediction model or buy a tool?")
- Structured fields: problem statement, proposed solution, expected benefits (quantified), costs, success metrics, timeline, risks
- AI grades on completeness, quantification quality, and executive readiness

**Content:** 20 scenarios across 6 domains
**Architecture:** New component, structured fields.

---

### Phase 3 — Technical Depth

---

#### Session 13 — SQL Event-Log Depth
**Priority:** Medium. Required for FAANG; increasingly tested at senior DA roles.
**Status:** 🔲 Not started

**What gets built:** 15 new SQL Prep problems covering event-log-based analytics

**New problem types:**
- Sessionization (convert event logs to sessions using time gap threshold)
- DAU/WAU/MAU from raw event table
- D1/D7/D30 retention cohort query
- Funnel analysis (ordered event sequences per user)
- Feature adoption rate from events
- Rolling 28-day active users
- Power user identification (top decile by action count)
- First-touch attribution from event stream

**Architecture:** Content only, extends existing SQL Prep mode.

---

#### Session 14 — Python for Analytics Mode
**Priority:** Medium. Growing requirement; not yet universal at DA level.
**Status:** 🔲 Not started

**What gets built:** New Python analytics drill mode

**Format:**
- Data manipulation scenario presented with a sample dataframe structure
- User describes their pandas approach (groupby, merge, pivot, handle nulls)
- AI grades on correctness, efficiency, and edge case handling

**Content:** 20 scenarios covering pandas, EDA, groupby aggregations, merge/join, missing data handling
**Architecture:** New component.

---

#### Session 15 — Excel Graded Drills
**Priority:** Medium. Excel still dominates at non-tech DA roles.
**Status:** 🔲 Not started

**What gets built:** Graded Excel scenario mode replacing current flashcard-only Excel mode

**Format:**
- Business question presented with data structure described
- User describes their Excel approach (which functions, which structure)
- AI grades on correctness and efficiency

**Content:** 20 scenarios covering XLOOKUP, pivot tables, Power Query, dynamic arrays, INDEX/MATCH, data validation
**Architecture:** New component.

---

### Phase 4 — FAANG Ceiling

---

#### Session 16 — Tableau Graded Drills
**Priority:** Lower. Tableau is tested at specific roles, not universally.
**Status:** 🔲 Not started

**What gets built:** Graded Tableau scenario mode

**Format:**
- Visualization challenge presented
- User describes their Tableau approach (chart type, calculated fields, LOD expressions, parameters)
- AI grades on visualization choice and technical approach

**Content:** 15 scenarios
**Architecture:** New component.

---

#### Session 17 — FAANG Multi-Turn Interview Sim
**Priority:** Lower. Relevant only for FAANG-targeted candidates.
**Status:** 🔲 Not started

**What gets built:** Multi-turn product analytics case study simulator

**Format:**
- AI plays a skeptical interviewer
- User answers questions over 4-6 turns
- AI asks follow-up probing questions each turn
- Full debrief after final turn

**Content:** 10 structured case studies across 6 domains
**Architecture:** New component, multi-turn conversation state.

---

### Phase 5 — Product Features

---

#### Infrastructure Session A — Vercel Edge Function
**Priority:** High (enables public access without API key).
**Status:** 🔲 Not started

Move API key server-side so any visitor can use the full app without their own Anthropic key. Required before LinkedIn post and public launch.

---

#### Infrastructure Session B — Supabase Persistence
**Priority:** Medium. Enables cross-session progress tracking.
**Status:** 🔲 Not started

Add Supabase backend so weak queue and progress persist across sessions and devices.

---

#### Infrastructure Session C — README Screenshots
**Priority:** High (fast win, high portfolio impact).
**Status:** 🔲 Not started

Add 3-4 UI screenshots to README. Takes 20 minutes. High visual impact for GitHub visitors.

---

## Full Content Summary (v1 + v2 complete)

| Mode | v1 | v2 Addition | Total |
|------|----|-------------|-------|
| KPI Library | 90 cards | +18 (product) | 108 |
| Dashboard Drill | 25 drills | +5 (product) | 30 |
| Problem to Metric | 38 scenarios | +8 (product) | 46 |
| Insight & Rec | 32 scenarios | +7 (product) | 39 |
| A/B Testing | — | 20 scenarios | 20 |
| Behavioral STAR | — | 30 questions | 30 |
| Data Quality | — | 25 scenarios | 25 |
| Metric Design | — | 30 scenarios | 30 |
| Stakeholder Comm | — | 25 scenarios | 25 |
| Business Case | — | 20 scenarios | 20 |
| SQL Event-Log | — | 15 problems | 15 |
| Python Analytics | — | 20 scenarios | 20 |
| Excel Graded | — | 20 scenarios | 20 |
| Tableau Graded | — | 15 scenarios | 15 |
| FAANG Sim | — | 10 case studies | 10 |
| **Total** | **185** | **+268** | **453** |

---

## Build Principles

1. **Content quality over speed.** Wrong patterns drilled daily train wrong habits. Every scenario gets a gold-standard answer before it ships.
2. **Ship incrementally.** Each session produces a working, production-deployed increment. No half-built features in main.
3. **Applications first.** Build sessions never replace application weeks. 10 applications per week is the floor regardless of build activity.
4. **Drill what exists before adding more.** New content only after existing content is exhausted at Strong level.
5. **Spec before code.** Every session starts with a locked scope. No mid-session scope additions.
