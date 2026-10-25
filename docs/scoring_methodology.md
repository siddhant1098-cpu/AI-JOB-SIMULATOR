# AI Job Simulator: Scoring Methodology & Evaluation Rubrics

## 1. Overview and Core Philosophy
The AI Job Simulator's scoring system is designed according to the **United States Office of Personnel Management (OPM) Assessment & Selection Principles** for structured, competency-based interviews and situational judgment tests (SJTs).

In traditional unstructured evaluations, scoring is subjective, prone to cognitive biases (halo effect, leniency, central tendency, contrast effect), and lacks clear correlation with workplace performance. Our framework addresses these limitations through:
1. **Behaviorally Anchored Rating Scales (BARS)**: Measuring observable actions rather than personality traits or abstract qualities.
2. **Explicit Competency Weighting**: Tailoring rubric weight distributions to the critical requirements of each specific scenario (with weights constrained to sum to exactly 100%).
3. **Deterministic Score Calculation**: Utilizing the LLM strictly as an evidence extractor and criterion rater (1–5 scale), while the authoritative final scoring arithmetic is computed deterministically in the backend code.

---

## 2. Deterministic Scoring Formula

For each scenario $S$, there are $N$ criteria.
Each criterion $i$ has an assigned non-negative weight $W_i$ such that:

$$\sum_{i=1}^{N} W_i = 100.0\%$$

For every criterion $i$, the candidate receives an integer rating $R_i \in \{1, 2, 3, 4, 5\}$ based on anchored behavioral evidence observed in their transcript.

The weighted points for criterion $i$ are computed as:

$$\text{weighted\_points}_i = \left(\frac{R_i}{5.0}\right) \times W_i$$

The total scenario score (on a 0–100 scale) is:

$$\text{Scenario Score} = \sum_{i=1}^{N} \text{weighted\_points}_i = \sum_{i=1}^{N} \left(\frac{R_i}{5.0}\right) \times W_i$$

### Properties of this Formula:
- **Minimum possible score**: When $R_i = 1$ for all $i$:
  $$\sum \frac{1}{5} \times W_i = 0.20 \times 100 = 20.0\%$$
  *(Reflects presence and completion of attempt; zero is reserved for total non-response or defiance).*
- **Maximum possible score**: When $R_i = 5$ for all $i$:
  $$\sum \frac{5}{5} \times W_i = 1.00 \times 100 = 100.0\%$$
- **Linearity & Predictability**: A 1-point increase in a criterion with weight $25\%$ yields exactly $+5.0$ total points.
- **Backend Enforced**: The LLM is never permitted to emit arbitrary overall scores. The backend validates and enforces the arithmetic.

---

## 3. Behaviorally Anchored Rating Scale (BARS: 1 to 5)

Every criterion is evaluated across five distinct behavioral levels:

| Rating | Classification | Behavioral Descriptor |
| :--- | :--- | :--- |
| **5** | **Exemplary / Mastery** | Proactively exhibits optimal behaviors, demonstrates systems thinking, anticipates downstream risks, balances stakeholder emotions and operational priorities, and communicates with exceptional clarity and poise. |
| **4** | **Proficient / Strong** | Meets all standard workplace expectations effectively. Communicates clearly, takes sound actions, handles pressure well, and provides constructive solutions with minimal gaps. |
| **3** | **Competent / Acceptable** | Demonstrates baseline competence and addresses the core dilemma, but responses may be reactive, somewhat vague, or miss secondary stakeholder considerations. |
| **2** | **Marginal / Developing** | Shows notable deficiencies: defensive tone, shifting blame, proposing unviable solutions, failing to prioritize, or showing weak emotional regulation under stress. |
| **1** | **Unsatisfactory / Ineffective** | Exhibits harmful workplace behaviors: hostility, panic, complete evasion of responsibility, ethical breaches, or ignoring critical constraints. |

---

## 4. The 10 Predefined Scenarios & Weightage Matrix

Each scenario is engineered around a high-stakes workplace dilemma, with weight distribution aligned with professional job analysis:

| # | Scenario ID | Scenario Name | Difficulty | Key Competency Breakdown & Weights |
|---|-------------|---------------|------------|-----------------------------------|
| 1 | `angry-client` | The Angry Client | Medium | De-escalation (20%), Root Cause Ownership (20%), Solution Actionability (30%), Customer Empathy (20%), Professional Poise (10%) = **100%** |
| 2 | `deadline-collision` | The Deadline Collision | Hard | Triage & Prioritization (30%), Stakeholder Renegotiation (25%), Tradeoff Analysis (20%), Proactive Communication (15%), Stress Resilience (10%) = **100%** |
| 3 | `team-conflict` | The Team Conflict | Medium | Active Listening & Impartiality (20%), Facilitation & Mediation (30%), Psychological Safety (20%), Action-Oriented Resolution (20%), Emotional Intelligence (10%) = **100%** |
| 4 | `ceo-surprise-question` | The CEO's Surprise Question | Hard | Executive Presence & Poise (25%), Intellectual Honesty / Admitting Unknowns (20%), Strategic Alignment (20%), Concise Delivery / Bottom-Line-First (25%), Structured Follow-up Plan (10%) = **100%** |
| 5 | `production-failure` | The Production Failure | Hard | Incident Triage & Containment (25%), Blameless Root Cause Mindset (25%), Cross-Team Status Communication (20%), Systematic Problem Solving (15%), Post-Mortem & Prevention (15%) = **100%** |
| 6 | `costly-mistake` | The Costly Mistake | Medium | Immediate Accountability / No Shifting Blame (25%), Damage Mitigation Plan (20%), Transparent Upward Communication (30%), Prevention Safeguards (15%), Composure Under Fire (10%) = **100%** |
| 7 | `challenging-interviewer` | The Challenging Interviewer | Hard | Poise Under Skepticism (30%), Evidence-Based Defense of Decisions (25%), Receptivity to Constructive Pushback (20%), Executive Gravitas (15%), Cognitive Agility (10%) = **100%** |
| 8 | `last-minute-presentation` | The Last-Minute Presentation | Medium | Rapid Synthesis & Prioritization (25%), Audience-Centric Messaging (25%), Calm Delivery Under Time Pressure (20%), Resourcefulness & Delegation (20%), Handling Unknowns (10%) = **100%** |
| 9 | `unrealistic-request` | The Unrealistic Request | Medium | Boundary Setting with Tact (25%), Data-Driven Feasibility Pushback (25%), Collaborative Alternative Solutions (20%), Expectation Management (20%), Relationship Preservation (10%) = **100%** |
| 10 | `ambiguous-assignment` | The Ambiguous Assignment | Easy | Clarifying Question Formulation (25%), Proactive Assumption Testing (25%), Incremental Milestone Scoping (20%), Alignment Seeking (20%), Autonomous Initiative (10%) = **100%** |

---

## 5. Branching Logic & Adaptive Dialogue

Each scenario incorporates **dynamic branching** to simulate realistic workplace dialogue:
- **Strong Response Branch (Score $\ge 70.0$)**:
  - The character acknowledges the candidate's strong points, lowers their defensive guard, and asks a deeper strategic follow-up question or accepts the proposed compromise.
- **Weak or Developing Response Branch (Score $< 70.0$)**:
  - The character pushes back on specific unaddressed gaps (e.g., demanding concrete timelines, noting the lack of empathy, or challenging an unviable technical claim), giving the candidate an authentic second-turn redemption opportunity.

---

## 6. Bias Mitigation & Standardization Protocols

To ensure fair, objective, and reproducible candidate assessments:
1. **Rubric-Constrained Prompts**: Evaluator prompts strictly isolate behavioral evidence from tone, accent, dialect, or demographic markers.
2. **Standardized Anchor Grounding**: The LLM must cite verbatim evidence or specific behaviors observed in the transcript before rendering an integer rating (1–5).
3. **Deterministic Backend Computation**: Score calculation cannot be hallucinated; it is strictly computed in Python using validated floating-point arithmetic.
4. **Idempotency & Replayability**: Evaluations store criteria ratings, weights, and evidence snippets, allowing auditing and review.

---

## 7. References
- **U.S. Office of Personnel Management (OPM)**: *Assessment Decision Guide & Structured Interview Methodologies*.
- **Society for Industrial and Organizational Psychology (SIOP)**: *Principles for the Validation and Use of Personnel Selection Procedures*.
- **Campion, M. A., Palmer, D. K., & Campion, J. E.**: *A review of structure in the selection interview*, Personnel Psychology, 50(3), 655-702.
