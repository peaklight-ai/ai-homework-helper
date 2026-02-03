# Setup Instructions: Wow Factor Release

## After All Phases Complete, Run These:

### 1. Database Migrations (Run in Supabase Dashboard)

Go to Supabase Dashboard → SQL Editor → New Query, then run each file in order:

```sql
-- Run in order:
-- 005_teacher_insights.sql
-- 006_schools_admin.sql
-- 007_parent_connection.sql
-- 008_badges.sql
```

Or run them from your terminal:
```bash
# If using Supabase CLI:
supabase db push
```

### 2. Install New Dependencies

```bash
npm install recharts jspdf html2canvas resend
```

### 3. Environment Variables

Add to `.env.local`:
```
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Get Resend API Key:**
1. Go to https://resend.com
2. Create account → Get API key
3. Add your domain or use sandbox for testing

### 4. Start Dev Server

```bash
npm run dev
```

### 5. Test Each Feature

#### Phase 4: Teacher Intelligence
- [ ] Log in as teacher
- [ ] Check "Today's Focus" card on dashboard
- [ ] Verify insights show for students with:
  - 3+ consecutive wrong answers (Struggling)
  - 5+ streak (Improving)
  - 3+ days inactive (Inactive)
  - XP milestones (Milestone)
- [ ] Click insight to jump to student
- [ ] Dismiss insights with X button

#### Phase 5: Admin Dashboard
- [ ] Access /admin as admin user
- [ ] View school-wide stats (teachers, students, XP)
- [ ] Check weekly activity chart
- [ ] Check topic breakdown chart
- [ ] View teacher leaderboard
- [ ] Test "Export PDF" button
- [ ] (Note: Will show demo data until school is set up)

**To set up a school:**
```sql
-- In Supabase SQL Editor:
INSERT INTO schools (name, admin_email) VALUES ('Your School', 'admin@school.com');
INSERT INTO admins (school_id, email, name, role)
SELECT id, 'admin@school.com', 'Admin Name', 'admin' FROM schools WHERE admin_email = 'admin@school.com';
-- Link teachers to school:
UPDATE teachers SET school_id = (SELECT id FROM schools WHERE admin_email = 'admin@school.com') WHERE email IN ('teacher1@school.com', 'teacher2@school.com');
```

#### Phase 6: Parent Connection
- [ ] Add parent email to a student (in teacher dashboard settings)
- [ ] Test weekly report generation: `GET /api/parent/report?studentId=xxx`
- [ ] Generate shareable profile: `POST /api/share` with `{ studentId: "xxx" }`
- [ ] View shareable profile at `/share/[token]`

**To set parent email:**
```sql
UPDATE students SET parent_email = 'parent@email.com' WHERE id = 'student-uuid';
```

#### Phase 7: Student Celebration
- [ ] Complete problems to unlock badges
- [ ] Check badge unlock celebration animation
- [ ] View badge collection in student profile
- [ ] Verify badge categories: Streak, Accuracy, XP, Problems, Special

---

## File Summary

### Phase 4: Teacher Intelligence
- `supabase/migrations/005_teacher_insights.sql` - Teacher insights table
- `lib/insightGenerator.ts` - Insight generation logic
- `app/api/insights/route.ts` - Insights API
- `components/TeacherInsights.tsx` - "Today's Focus" card

### Phase 5: Admin Dashboard
- `supabase/migrations/006_schools_admin.sql` - Schools & admin tables
- `lib/schoolStats.ts` - School statistics generator
- `app/api/admin/stats/route.ts` - Admin stats API
- `app/admin/page.tsx` - Admin dashboard page

### Phase 6: Parent Connection
- `supabase/migrations/007_parent_connection.sql` - Parent reports tables
- `lib/parentReports.ts` - Report generation & email
- `app/api/parent/report/route.ts` - Parent report API
- `app/api/share/route.ts` - Shareable profile API
- `app/share/[token]/page.tsx` - Public shareable profile page

### Phase 7: Student Celebration
- `supabase/migrations/008_badges.sql` - Badge definitions & student badges
- `lib/badges.ts` - Badge system logic
- `app/api/badges/route.ts` - Badges API
- `components/BadgeUnlockCelebration.tsx` - Badge unlock animation
- `components/BadgeCollection.tsx` - Badge collection display

---

## Git Commit Commands

```bash
# Stage all changes
git add -A

# Commit Phase 4
git commit -m "feat: add Teacher Intelligence with Today's Focus insights

- Add teacher_insights table migration
- Create insight generator for struggling/improving/inactive/milestone detection
- Add insights API endpoint
- Create TeacherInsights component with dismiss functionality
- Integrate into teacher dashboard

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# Or commit everything at once
git commit -m "feat: add Wow Factor release (Phases 4-7)

Phase 4: Teacher Intelligence
- Zero-input insights for struggling/improving/inactive students
- Today's Focus card on teacher dashboard

Phase 5: Admin Dashboard
- School-wide analytics with charts
- Teacher leaderboard
- PDF export functionality

Phase 6: Parent Connection
- Weekly automated parent reports
- Shareable student profiles
- Email integration with Resend

Phase 7: Student Celebration
- Badge system with 24 unique badges
- 5 rarity tiers (common to legendary)
- Badge unlock celebration animation
- Badge collection display

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---
*This file will be updated as phases are built*
