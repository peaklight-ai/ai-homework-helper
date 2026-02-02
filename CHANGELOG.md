# Changelog

All notable changes to AI Homework Helper will be documented in this file.

## [2.2.0] - 2026-02-02

### Sprint 1: Teacher Experience

- **Class Management** - Full class organization system
  - Create, edit, delete classes
  - Students organized by class (not mixed lists)
  - Class dropdown in teacher dashboard
  - Class-scoped student views

- **CSV Import** - Bulk student import
  - Drag-and-drop CSV upload
  - Preview with validation (valid/invalid rows)
  - Format: name,grade columns
  - Auto-enroll to selected class

- **Exercise System** - Teacher-created exercises
  - Create exercises with question, answer, difficulty, domain, grade
  - Assign exercises to entire class OR specific students
  - Optional due date for assignments
  - Exercises tab in teacher dashboard

- **Bug Fixes**
  - ✅ BUG-01: App no longer blocks after correct answer
  - ⏸️ BUG-02: Email SMTP configuration (deferred)

### Sprint 2: Student Experience & Analytics

- **Diagnostic System** - Adaptive placement test
  - Automatically shown on student's first login
  - 12 questions across domains (addition, subtraction, multiplication, division)
  - Adaptive difficulty based on responses
  - Results auto-set student's difficulty level
  - Results visible to teacher

- **Student Targets** - Teacher-set objectives
  - Teachers can set learning goals for students
  - Students see their targets on home screen
  - Mark targets as complete

- **Topic Mastery** - Strengths/weaknesses tracking
  - Track performance by math domain
  - Calculate mastery percentages
  - Visual progress bars

- **Cognitive Visibility** - Learning profile for teachers
  - Diagnostic results summary
  - Strengths and areas to improve
  - All topics mastery overview

### New Components

- `ClassSelector.tsx` - Class dropdown with "All Students" option
- `CreateClassModal.tsx` - Modal for creating new classes
- `CSVImportModal.tsx` - CSV upload with preview/validation
- `ExerciseUploadForm.tsx` - Create new exercises
- `ExerciseAssignmentModal.tsx` - Assign exercises to class/students
- `DiagnosticTest.tsx` - Full-screen diagnostic flow
- `StudentTargets.tsx` - Display and manage student targets
- `StudentProfile.tsx` - Mastery and cognitive insights

### New API Routes

- `/api/classes` - Class CRUD operations
- `/api/exercises` - Exercise CRUD
- `/api/exercises/assign` - Exercise assignment
- `/api/diagnostic` - Diagnostic test flow
- `/api/targets` - Student targets CRUD
- `/api/mastery` - Topic mastery tracking

### Buffer Week Polish

- **Hints & Strategies** - Teachers can add hints and teaching strategies to exercises
  - Up to 5 hints per exercise (progressively shown to students)
  - Teaching strategy guides how AI tutors the problem
  - Collapsible UI in exercise form

- **Pedagogy-Based AI Guidance** - AI adapts teaching style by grade
  - Grades 1-2: Very guided, solve together, concrete examples
  - Grade 3: Model and scaffold, teach vocabulary
  - Grades 4-6: Coach and extend, encourage independence

- **Adaptive Progression Logic** - Grade-based difficulty adjustment
  - Grade 1: Very patient (4 correct to level up)
  - Grades 4-6: More challenging (2 correct to level up)

### Database Migrations

**Note:** Run these in Supabase Dashboard:
- `002_exercises.sql` - Classes and exercises tables
- `003_diagnostic_system.sql` - Diagnostic and analytics tables
- `004_hints_progression.sql` - Hints, strategies, and progression rules

---

## [2.1.0] - 2026-01-18

### New Features

- **Supabase Integration** - Full cloud database with Row Level Security
  - Real-time data sync across devices
  - Secure authentication with email/password for teachers
  - Student login with simple 6-digit codes (no email required)
  - PostgreSQL database for persistent storage

- **Teacher Authentication** - Secure teacher accounts
  - Email/password signup and login
  - Protected routes (teacher dashboard, upload)
  - Session persistence across browser refreshes

- **Student Login System** - Kid-friendly authentication
  - 6-character alphanumeric codes (easy to type, hard to guess)
  - No email required for students
  - Session saved in browser for quick return
  - Teacher-generated codes displayed in dashboard

- **Per-Student Settings** - Customizable learning experience
  - **Topic Selection**: Teachers choose which topics each student can practice
    - Addition, Subtraction, Multiplication, Division
  - **Difficulty Levels**: 1-5 scale per student
  - Problems filtered based on student's allowed topics and difficulty
  - Settings modal in teacher dashboard

- **Homework Photo Upload (OCR)** - Upload and solve homework problems
  - Camera capture for taking photos of homework
  - File picker for uploading existing images
  - Tesseract.js for extracting text from images
  - Automatic math expression detection
  - Edit extracted text before solving
  - AI guides student through uploaded problems

- **Progress Sync** - Cloud-synced student progress
  - XP, streaks, and accuracy sync to Supabase
  - Progress persists across devices
  - Teacher dashboard shows real-time progress

### Technical Changes

- Add Supabase client library (`@supabase/supabase-js`, `@supabase/ssr`)
- Add Tesseract.js for OCR functionality
- Create `/lib/supabase.ts` with database types and helper functions
- Create `/lib/ocr.ts` with OCR processing and math text cleaning
- Create API routes:
  - `/api/teachers` - Teacher record creation
  - `/api/students` - Student CRUD operations
  - `/api/progress` - Progress tracking
  - `/api/settings` - Student settings management
  - `/api/auth/student` - Student login with codes
- Add middleware for route protection
- Add SupabaseProvider context for auth state
- New components:
  - `StudentLogin` - Kid-friendly login UI
  - `HomeworkUpload` - Photo upload with OCR
  - `SupabaseProvider` - Auth context provider

### Database Schema

```sql
-- Tables added in V3:
-- teachers (id, email, name)
-- students (id, teacher_id, name, grade, avatar_seed, login_code)
-- progress (student_id, total_xp, level, streaks, questions, accuracy)
-- student_settings (student_id, allowed_topics[], difficulty_level)
-- custom_problems (teacher_id, question, answer, difficulty, hint)
-- homework_uploads (student_id, image_url, extracted_text, status)
```

---

## [2.0.0] - 2025-12-08

### Bug Fixes
- Fix input blocked after correct answer - now shows "Try Another Problem" button immediately
- Fix overly positive AI responses on mistakes - AI now gives neutral feedback for wrong answers
- Fix AI asking follow-up questions after correct answers - now just congratulates
- Hide topic labels from students - removed topic display from problem card
- Fix "Try Another Problem" reloading entire page - now uses callback to stay in session

### New Features
- **App Renamed to "Valid"** - New branding with PLAI identity
- **Adventure Hub Design** - Complete kid-friendly UI redesign
  - Warm cream-to-purple gradient backgrounds (no more gray!)
  - Large hero avatar with XP progress ring
  - Floating star/sparkle decorations
  - Big "Let's Go!" button with rocket animation
  - Kid-friendly copy ("Ready for an adventure?")
- **Student Picker** - "Who's Playing Today?" character selection screen
  - Students select from teacher-created profiles (no self-registration)
  - Large avatar cards with grade badges
  - Switch Student button for shared classroom devices
- **Teacher-Managed Student Profiles** - Teachers add students via dashboard
  - Add Student form with name and grade selection
  - Delete student with confirmation
  - Students cannot create their own profiles
- **Student Profiles** - Profile system with avatars
  - Uses Dexie.js (IndexedDB) for persistent browser storage
  - DiceBear API for fun, kid-friendly avatars (light skin tones)
  - Profile switcher for siblings/classmates sharing a device
- **Custom Question Upload** - Teachers can add their own math problems
  - Manual entry form: question, answer, difficulty, hints
  - Stored in IndexedDB via Dexie.js
  - Export/Import JSON backup to prevent data loss
  - New /upload page for managing custom problems
- **Expanded Math Domains** - Cover all primary school math (22 sample problems):
  - Number & Operations (counting, place value, +−×÷, fractions, decimals)
  - Algebraic Thinking (patterns, sequences, simple equations)
  - Geometry (shapes, symmetry, angles, perimeter/area)
  - Measurement (length, weight, volume, time, temperature)
  - Data Handling (tables, charts, graphs)
  - Problem Solving (word problems, multi-step, logical reasoning)
- **Export/Import Profile** - Backup and restore student data (included in ProfileCard)
- **Teacher Dashboard ("Valid")** - Dark-themed dashboard at `/teacher` for teachers
  - **Chalkboard Night Theme** - Professional dark UI with PLAI branding
    - Deep navy background (#020617), slate cards (#0F172A)
    - Sky blue primary (#38BDF8), yellow XP accents (#FACC15)
    - Green success (#22C55E), pink warnings (#FB7185)
  - Class overview stats (total students, XP, accuracy, students at goal)
  - Student list with XP progress bars and goal completion indicators
  - Individual student details (progress, streaks, accuracy)
  - **Configurable XP Goals with Deadlines** - Teachers can set:
    - XP target (100-500 XP presets)
    - Due date with quick shortcuts (Tomorrow, Friday, Next Week)
    - School day end time (when goals are due each day)
    - Visual countdown showing days remaining
  - **PLAI Footer Signature** - peaklight.ai branding with compass logo
- **Confetti Celebration** - Triple confetti burst on correct answers using canvas-confetti
- **XP Progress Ring** - Circular progress bar around avatar showing level progress

### Technical Changes
- Migrate from localStorage to Dexie.js (IndexedDB wrapper)
- Add DiceBear avatar integration with light skin tones
- Grade-level filtering for problems (grades 1-6)
- Add Ollama/llama3.1 support for local testing (USE_OLLAMA env var)
- Add react-circular-progressbar for XP visualization
- Add canvas-confetti for celebrations
- Add dev mode indicator in teacher dashboard

---

## [1.0.0] - 2025-11-19

### Features
- Socratic AI tutoring method (guides with questions, never gives direct answers)
- Real-time streaming AI responses via CometAPI/Gemini 2.5 Flash
- Gamification: XP system (+50 per correct answer), confetti celebrations
- 8 sample math problems (basic arithmetic)
- Free trial: 5 messages per browser session
- Password bypass ("cynthia") for unlimited access
- KaTeX rendering for mathematical expressions

### Technical Stack
- Next.js 16 + React 19 + TypeScript
- Chakra UI + Framer Motion + Tailwind CSS
- Deployed on Vercel

---

# Roadmap

## Version 2.0 (Complete)
- Bug fixes from demo feedback
- Student profiles (browser-based)
- Custom question upload
- Expanded math domains

## Version 2.1 (Complete)
**Database Integration + OCR**

- ✅ **Supabase Integration** - Cloud database with auth and RLS
- ✅ **Teacher Authentication** - Email/password login for teachers
- ✅ **Student Login Codes** - Simple 6-digit codes for kids
- ✅ **Per-Student Settings** - Topic/difficulty selection per student
- ✅ **Image Upload (OCR)** - Tesseract.js to extract problems from homework photos
- ✅ **Progress Sync** - XP and progress synced to cloud

## Version 3.0 (Vision)
- **Multi-language** - French version for French system schools
- **Placement Test** - Assess student level, generate personalized profile
- **Learning Specialist Tools** - Support for orthopédagogues
- **ClassDojo Integration** - API collaboration
- **Gizmo-style Simulations** - Interactive math visualizations
- **Badge System** - Achievement unlocks (schema already defined)
- **Leaderboards** - Class/school rankings

---

# OSS Libraries

| Library | Purpose | Status |
|---------|---------|--------|
| [Dexie.js](https://dexie.org) | IndexedDB wrapper for offline storage | ✅ V2.0 |
| [DiceBear](https://www.dicebear.com/) | Fun avatar generation | ✅ V2.0 |
| [canvas-confetti](https://github.com/catdad/canvas-confetti) | Celebration animations | ✅ V2.0 |
| [react-circular-progressbar](https://github.com/kevinsqi/react-circular-progressbar) | XP level progress ring | ✅ V2.0 |
| [Tesseract.js](https://github.com/naptha/tesseract.js) | OCR for homework photos | ✅ V2.1 |
| [@supabase/supabase-js](https://github.com/supabase/supabase-js) | Supabase client | ✅ V2.1 |
| [@supabase/ssr](https://github.com/supabase/ssr) | Supabase SSR utilities | ✅ V2.1 |
| [MathLive](https://github.com/arnog/mathlive) | Math input keyboard | V3 Roadmap |
