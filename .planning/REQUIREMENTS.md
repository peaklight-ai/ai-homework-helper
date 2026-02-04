# Requirements: v2.3.0 PM Feedback Fixes

**Defined:** 2026-02-03
**Core Value:** Students receive personalized math tutoring that adapts to their actual competency level, with teachers having full visibility and control over the learning journey.

## v1 Requirements

### Bug Fixes

- [ ] **BUG-01**: Fix "Failed to create exercise" error in exercise upload form
- [ ] **BUG-02**: Fix assigned exercises not appearing in student profile/home
- [ ] **BUG-03**: Fix assigned exercises not appearing in teacher dashboard
- [ ] **BUG-04**: Fix quiz/diagnostic performance (reduce latency)
- [ ] **BUG-05**: Fix answer box color visibility issue (contrast problem)
- [ ] **BUG-06**: Show student grade next to name in UI header

### Data Visibility

- [ ] **VIS-01**: Teacher can view diagnostic test results per student
- [ ] **VIS-02**: Teacher can view exercise completion results per student
- [ ] **VIS-03**: Hide exercise hints from student view (teacher-only)
- [ ] **VIS-04**: Hide target strategy details from student view (teacher-only)

### Content Quality

- [ ] **CONTENT-01**: Add subtraction questions to diagnostic test
- [ ] **CONTENT-02**: Add multiplication questions to diagnostic test
- [ ] **CONTENT-03**: Add division questions to diagnostic test
- [ ] **CONTENT-04**: Add word problems / problem-solving questions to diagnostic
- [ ] **CONTENT-05**: Implement grade-level filtering for diagnostic questions
- [ ] **CONTENT-06**: Document level determination algorithm in code comments

### Student Management

- [ ] **STUDENT-01**: Teacher can edit student name after creation
- [ ] **STUDENT-02**: Teacher can edit student grade after creation
- [ ] **STUDENT-03**: Teacher can change student's class assignment

### Feature Deployment

- [ ] **DEPLOY-01**: Run Topic Mastery database migration (003_diagnostic_system.sql)
- [ ] **DEPLOY-02**: Run Cognitive Visibility database migration
- [ ] **DEPLOY-03**: Verify Topic Mastery UI displays correctly with real data
- [ ] **DEPLOY-04**: Verify Cognitive Visibility UI displays correctly with real data

### AI Enhancement

- [ ] **AI-01**: AI tutor reads student's current target at session start
- [ ] **AI-02**: AI adapts tutoring approach to work toward student's target goal

---

## v2 Requirements (Deferred)

- Multi-language support (French, Arabic)
- Parent progress reports
- Badge/achievement system
- Leaderboards
- ClassDojo integration

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Student-uploaded exercises | Teacher controls content for now |
| Real-time teacher-student chat | Not essential for tutoring flow |
| Mobile app | Web-first approach |
| PDF report export | Dashboard sufficient for v2.3 |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BUG-01 | Phase 1 | Pending |
| BUG-02 | Phase 1 | Pending |
| BUG-03 | Phase 1 | Pending |
| BUG-04 | Phase 1 | Pending |
| BUG-05 | Phase 1 | Pending |
| BUG-06 | Phase 1 | Pending |
| VIS-01 | Phase 2 | Pending |
| VIS-02 | Phase 2 | Pending |
| VIS-03 | Phase 2 | Pending |
| VIS-04 | Phase 2 | Pending |
| CONTENT-01 | Phase 3 | Pending |
| CONTENT-02 | Phase 3 | Pending |
| CONTENT-03 | Phase 3 | Pending |
| CONTENT-04 | Phase 3 | Pending |
| CONTENT-05 | Phase 3 | Pending |
| CONTENT-06 | Phase 3 | Pending |
| STUDENT-01 | Phase 4 | Pending |
| STUDENT-02 | Phase 4 | Pending |
| STUDENT-03 | Phase 4 | Pending |
| DEPLOY-01 | Phase 5 | Pending |
| DEPLOY-02 | Phase 5 | Pending |
| DEPLOY-03 | Phase 5 | Pending |
| DEPLOY-04 | Phase 5 | Pending |
| AI-01 | Phase 6 | Pending |
| AI-02 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0

---
*Requirements defined: 2026-02-03*
*Phase mapping: 2026-02-03*
