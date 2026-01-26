# Project Research Summary

**Project:** Valid - AI Homework Helper (Adaptive Learning Features)
**Domain:** EdTech K-6 Math Tutoring with Teacher Dashboard
**Researched:** 2026-01-26
**Confidence:** HIGH

## Executive Summary

Valid is extending from a Socratic math tutoring app into a full adaptive learning platform with diagnostic assessments, student profiling, class management, and teacher analytics. Research across stack, features, architecture, and pitfalls reveals a clear path: **start with class management (foundation), then diagnostic assessment (placement), then student profiling (cognitive visibility), and finally enhanced analytics (teacher workflow)**.

The recommended approach leverages the existing Next.js/Supabase stack with targeted additions: PapaParse for CSV import, Tremor for analytics dashboards, TanStack Table for class management, and a custom adaptive difficulty algorithm (not full IRT). The architecture extends the current schema with 11 new tables organized into four phases following a strict dependency order. The key insight from feature research is that **cognitive visibility (seeing how students reason, not just what they answer) is Valid's primary differentiator** - most competitors only track right/wrong answers.

Critical risks include: (1) feedback loop disasters where adaptive algorithms misinterpret guessing as low ability, (2) ceiling/floor effects in diagnostics that fail to measure students at extremes, (3) teacher dashboard information overload, and (4) COPPA/FERPA compliance for data on children under 13. All are preventable with proper design: response-time tracking for guess detection, adaptive diagnostic spanning 2 grades above/below target, progressive disclosure in dashboards, and data minimization from day one.

## Key Findings

### Recommended Stack

The existing stack (Next.js 16, React 19, Supabase, Chakra UI) remains unchanged. Research identified additive libraries that integrate cleanly.

**Core technologies:**
- **PapaParse** (CSV): Fastest browser CSV parser, no dependencies, handles malformed input gracefully - avoid xlsx due to security vulnerabilities
- **react-dropzone** (File Upload): De facto React standard for drag-and-drop, works seamlessly with PapaParse
- **Zod** (Validation): TypeScript-first schema validation for imported data, clear error messages for teachers
- **Tremor** (Analytics): Vercel-backed dashboard components built on Recharts, Tailwind-native, minimal config
- **TanStack Table** (Data Tables): Headless table logic, MIT license, pairs with existing Chakra UI for styling
- **date-fns** (Dates): Functional, tree-shakeable, TypeScript-first - avoid moment.js
- **Custom adaptive algorithm**: Simplified difficulty bracketing, not full IRT (no production JS IRT libraries exist)

**What NOT to install:**
- xlsx/SheetJS (security vulnerabilities)
- AG Grid (overkill, enterprise paywall)
- moment.js (deprecated, large bundle)

### Expected Features

**Must have (table stakes):**
- Initial placement diagnostic test (standard in IXL, i-Ready, DreamBox)
- Adaptive difficulty that adjusts based on responses
- Grade-level proficiency scores and topic breakdown
- Bulk CSV student import (every major platform supports this)
- Real-time progress dashboard with accuracy metrics
- Class/group organization with student roster management
- Printable progress reports for parent conferences

**Should have (differentiators):**
- **Cognitive process visibility** (PRIMARY DIFFERENTIATOR): Teacher sees HOW student thinks via Socratic dialogue capture
- Thinking process replay: Review the back-and-forth conversation
- Misconception identification: AI flags specific conceptual errors
- Intervention alerts: Notify teacher when student struggles repeatedly

**Defer (v2+):**
- Clever/ClassLink integrations (until district sales)
- Predictive analytics and AI-generated insight summaries
- Live classroom view (WebSocket complexity)
- PDF report generation (existing dashboard sufficient for MVP)

### Architecture Approach

The architecture adds 11 new tables organized into four dependency-ordered phases. Core pattern: classes are foundational (students must be organized before assignment), exercises enable diagnostics (questions come from exercise pool), diagnostics inform profiles (initial assessment creates baseline), and profiles enable adaptive learning.

**Major components:**
1. **classes / class_students**: Foundation for organizing students, enables bulk import
2. **exercises / exercise_hints / exercise_assignments**: Teacher-uploaded problems with assignment capabilities
3. **diagnostic_results / diagnostic_attempts**: Completed assessments with rich attempt data
4. **skill_taxonomy / skill_mastery / student_profiles / reasoning_logs**: Dynamic profiles that evolve from learning interactions

**Key patterns to follow:**
- Denormalized profile aggregation (compute expensive analytics async, not on every request)
- Mastery level calculation with IRT-inspired updates (weight by difficulty)
- Skill decay over time (confidence decreases without practice)

**Anti-patterns to avoid:**
- Real-time profile computation via complex JOINs
- Storing raw conversation history (use AI-generated summaries)
- Adding class_id directly to students table (use junction table for enrollment history)

### Critical Pitfalls

1. **Feedback loop disasters in adaptive systems** - Algorithms misinterpret rapid guessing as low ability, assign easier content, students get bored and guess more, spiral continues. **Prevention:** Track response time, implement guess detection, add circuit breakers that flag for teacher review.

2. **Ceiling/floor effects in diagnostics** - Static tests designed for grade-level means advanced students answer everything correct (no useful data) and struggling students answer everything wrong (demoralized). **Prevention:** Implement adaptive diagnostic that adjusts difficulty, include questions spanning 2 grades above/below target.

3. **Over-remediation from coarse diagnostics** - "Doesn't know fractions" when student actually knows most concepts but needs minor gap remediation. **Prevention:** Multiple questions per sub-skill, just-in-time diagnosis during tutoring rather than single high-stakes test.

4. **Teacher dashboard information overload** - Shows every metric available but teachers can't extract actionable insights. **Prevention:** Lead with actionable summaries ("3 students need attention"), progressive disclosure, design with teachers.

5. **COPPA/FERPA compliance failures** - Collecting data on children under 13 without proper consent, 2025 amendments tightened requirements. **Prevention:** Minimal data collection, formal retention policy, rely on school authorization under FERPA.

## Implications for Roadmap

Based on research, suggested phase structure follows dependency order: classes enable bulk import, exercises enable diagnostics, diagnostics enable profiles.

### Phase 1: Class Management & Bulk Import
**Rationale:** Foundation for everything else. Can't assign exercises or run diagnostics until students are organized into classes. CSV import is table stakes for classroom testing with 20+ students.
**Delivers:** Classes table, class_students junction, bulk CSV import workflow
**Addresses:** Class/group organization, student roster management, bulk import (table stakes from FEATURES.md)
**Uses:** PapaParse, react-dropzone, Zod, TanStack Table (from STACK.md)
**Avoids:** Curriculum misalignment pitfall by adding topic selection at class level

### Phase 2: Exercise System & Assignments
**Rationale:** Diagnostic tests need a question pool. Building exercises as standalone entities enables reuse across diagnostic, practice, and assignments.
**Delivers:** exercises table, exercise_hints, exercise_assignments, teacher exercise upload UI
**Addresses:** Teacher-created content, homework uploads foundation
**Implements:** exercises component from ARCHITECTURE.md
**Avoids:** Question bank inadequacy (current 30 problems insufficient for adaptive system)

### Phase 3: Diagnostic Assessment
**Rationale:** With classes organized and exercises available, can now assess initial student levels. Diagnostic is the foundation for all profiling.
**Delivers:** diagnostic_results, diagnostic_attempts, adaptive diagnostic algorithm, grade-level placement
**Addresses:** Initial placement test, adaptive difficulty, proficiency scores (table stakes)
**Implements:** Diagnostic flow from ARCHITECTURE.md
**Avoids:** Ceiling/floor effects (adaptive algorithm), over-remediation (granular sub-skill coverage)

### Phase 4: Student Profiling & Cognitive Visibility
**Rationale:** With diagnostic data, can now build dynamic profiles showing strengths, weaknesses, and reasoning patterns. This is Valid's primary differentiator.
**Delivers:** skill_taxonomy, skill_mastery, student_profiles, reasoning_logs, teacher view of student thinking
**Addresses:** Cognitive process visibility (PRIMARY DIFFERENTIATOR), misconception identification
**Implements:** Profiling components from ARCHITECTURE.md
**Avoids:** Static profiles pitfall (implement decay functions, continuous updates)

### Phase 5: Teacher Analytics Dashboard
**Rationale:** With profile data flowing, can surface insights to teachers. Build last to ensure underlying data is reliable.
**Delivers:** Class overview analytics, individual student drill-down, intervention alerts, printable reports
**Addresses:** Real-time progress dashboard, at-risk student flagging, progress reports
**Uses:** Tremor, date-fns (from STACK.md)
**Avoids:** Information overload (progressive disclosure, actionable summaries)

### Phase Ordering Rationale

- **Dependency chain:** Classes -> Exercises -> Diagnostics -> Profiles -> Analytics (each phase requires the previous)
- **Value delivery:** Phase 1 (bulk import) provides immediate teacher value; Phase 4 (cognitive visibility) delivers the primary differentiator
- **Risk mitigation:** Building in this order allows validation at each stage before adding complexity
- **Pitfall avoidance:** Feedback loop detection requires exercises and diagnostic data to exist first; dashboard can't be designed until profile schema is stable

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 3 (Diagnostic):** Adaptive algorithm design needs tuning - start conservative and adjust based on real student data. Consider consulting learning science literature on CAT (Computerized Adaptive Testing).
- **Phase 4 (Cognitive Visibility):** Novel feature space with less direct precedent. May need iteration on what AI-generated insights are most valuable to teachers.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Class Management):** Well-documented patterns, straightforward CRUD operations
- **Phase 2 (Exercises):** Extension of existing custom_problems pattern
- **Phase 5 (Analytics):** Tremor provides pre-built components, mainly composition work

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Industry-standard libraries, verified with npm downloads, benchmarks, and official docs |
| Features | HIGH | Verified against IXL, Khan Academy, DreamBox, Mathletics official documentation |
| Architecture | HIGH | Based on existing schema plus established LMS patterns from research literature |
| Pitfalls | MEDIUM | Cross-verified from multiple sources, but specific implementation details need validation |

**Overall confidence:** HIGH

### Gaps to Address

- **Adaptive algorithm tuning:** Custom difficulty bracketing is simpler than full IRT but may need adjustment based on real student data. Plan for A/B testing different thresholds.
- **Question bank size:** Current 30 problems insufficient. Phase 2 must include strategy for expanding exercise pool (teacher upload, AI generation, or licensed content).
- **Guess detection thresholds:** Response time thresholds for "suspicious" answers need calibration per grade level (younger students naturally slower).
- **COPPA compliance audit:** Should audit current Supabase schema for data minimization before Phase 1 goes live with class management.
- **Profile freshness display:** Research recommends showing teachers how recent profile data is, but specific UX not defined.

## Sources

### Primary (HIGH confidence)
- [PapaParse Official](https://www.papaparse.com/) - CSV parsing benchmarks
- [Tremor Official](https://www.tremor.so/) - Dashboard components
- [TanStack Table](https://tanstack.com/table/) - Headless table documentation
- [IXL Real-Time Diagnostic](https://www.ixl.com/diagnostic) - Diagnostic methodology
- [Supabase RLS Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) - Security patterns
- [Zod Official](https://zod.dev/) - Schema validation

### Secondary (MEDIUM confidence)
- [Journal of Learning Analytics](https://learning-analytics.info/) - Teacher dashboard design
- [Carnegie Learning Blog](https://www.carnegielearning.com/blog/) - Assessment pitfalls
- [Frontiers in Education - Socratic AI](https://www.frontiersin.org/journals/education) - Socratic method balance
- [Deep-IRT Paper](https://arxiv.org/pdf/1904.11738) - Mastery estimation algorithms
- [NGLC Learner Profiles Guide](https://www.nextgenlearning.org/articles/getting-to-know-you-learner-profiles-for-personalization) - Dynamic profiling

### Tertiary (LOW confidence, needs validation)
- Custom adaptive algorithm effectiveness (needs real-world testing)
- Skill decay rate parameters (literature varies, start conservative)
- Optimal diagnostic length per grade level (may need adjustment)

---
*Research completed: 2026-01-26*
*Ready for roadmap: yes*
