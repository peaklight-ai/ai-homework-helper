# Database Migrations

Run these SQL migrations in Supabase Dashboard (SQL Editor) **in order**:

## Required Migrations

| Migration | Purpose | Status |
|-----------|---------|--------|
| `001_classes.sql` | Classes and enrollments | Required |
| `002_exercises.sql` | Exercise upload and assignments | Required |
| `003_diagnostic_system.sql` | Diagnostic tests, topic mastery, targets | Required |
| `004_hints_progression.sql` | Hints/strategies, progression rules | Required |

## How to Run

1. Go to Supabase Dashboard → SQL Editor
2. Open each file from `supabase/migrations/`
3. Copy the SQL content
4. Paste in SQL Editor and click "Run"
5. Verify no errors

## Order Matters!

Run in sequence because later migrations depend on tables from earlier ones:
- `002` depends on `001` (classes table)
- `003` depends on `001` (students, teachers tables)
- `004` depends on `002` (exercises table)

## After Running

Features that will start working:
- Exercise creation (fixes "Failed to create exercise")
- Topic Mastery display
- Cognitive Visibility display
- Student targets

## Verify Success

Check these tables exist in Supabase Table Editor:
- `classes`
- `class_students`
- `exercises`
- `exercise_assignments`
- `diagnostic_tests`
- `diagnostic_questions`
- `diagnostic_responses`
- `topic_mastery`
- `student_targets`
- `progression_rules`
