# Phase 4: Teacher Intelligence

## Objective
Teachers receive daily insights about their students without entering any data. The system tells them what they need to know.

## Requirements

| REQ-ID | Description | Priority |
|--------|-------------|----------|
| INTEL-01 | Teacher insights database table | HIGH |
| INTEL-02 | Insight generation algorithm | HIGH |
| INTEL-03 | "Today's Focus" dashboard component | HIGH |
| INTEL-04 | Student insight detail view | MEDIUM |

## Implementation Steps

1. Create database migration for teacher_insights table
2. Create insight generator logic in lib/
3. Create API route for fetching/generating insights
4. Create TeacherInsights component
5. Integrate into teacher dashboard

## Success Criteria
- [ ] Teacher sees "Today's Focus" card on dashboard
- [ ] Card highlights students needing attention
- [ ] Insight types: struggling, improving, inactive, milestone
