# Valid V3.0 - Release Notes

## Overview

V3.0 transforms Valid from a browser-only app into a cloud-connected platform with real authentication, per-student customization, and homework photo scanning.

---

## New Features

### 1. Teacher Authentication

**What it is:** Teachers now have secure accounts with email/password login.

**How to use:**
1. Go to `/auth/signup`
2. Enter your name, email, and password
3. Click "Create Account"
4. You'll be redirected to the Teacher Dashboard

**After signup:** You can log in anytime at `/auth/login`

---

### 2. Student Login Codes

**What it is:** Each student gets a simple 6-character code (like "ABC123") to log in. No email required - perfect for kids.

**How to use:**

*For Teachers:*
1. Go to Teacher Dashboard (`/teacher`)
2. Click "Add Student"
3. Enter student name and grade
4. The system generates a unique login code (shown in the student list)
5. Share this code with the student/parent

*For Students:*
1. Open the app (main page)
2. Enter your 6-character code
3. Click "Let's Go!"
4. You're logged in and can start learning

---

### 3. Per-Student Topic & Difficulty Settings

**What it is:** Teachers can customize what each student practices. Select which math operations they can see and set their difficulty level.

**How to use:**
1. Go to Teacher Dashboard
2. Find the student in the list
3. Click the gear icon (Settings)
4. **Topics:** Check/uncheck: Addition, Subtraction, Multiplication, Division
5. **Difficulty:** Select level 1-5 (higher = harder numbers)
6. Click "Save Settings"

**What happens:** When that student practices, they'll only see problems matching their allowed topics and difficulty.

---

### 4. Homework Photo Upload (OCR)

**What it is:** Students can take a photo of their homework and the app will read the math problem using OCR (Optical Character Recognition).

**How to use:**
1. Log in as a student
2. Go to `/upload` (or click the camera button)
3. Choose:
   - **Take Photo** - Use device camera
   - **Upload** - Select an existing image
4. Review the photo preview
5. Click "Read Text"
6. The app extracts the math problem
7. Edit if needed, then click "Solve It!"
8. Work through the problem with AI guidance

**Best results:** Clear photos with good lighting, printed or neatly written text.

---

### 5. Cloud Progress Sync

**What it is:** Student progress (XP, streaks, accuracy) is saved to the cloud. Students can log in from any device and see their progress.

**How it works:**
- Progress syncs automatically after each correct answer
- Teachers see real-time progress in their dashboard
- Data persists even if browser cache is cleared

---

## Technical Details

### Database (Supabase)

| Table | Purpose |
|-------|---------|
| `teachers` | Teacher accounts (linked to Supabase Auth) |
| `students` | Student profiles with login codes |
| `progress` | XP, levels, streaks, accuracy per student |
| `student_settings` | Allowed topics and difficulty per student |
| `homework_uploads` | OCR upload history |

### New Pages

| URL | Purpose |
|-----|---------|
| `/auth/signup` | Teacher registration |
| `/auth/login` | Teacher login |
| `/teacher` | Teacher dashboard (protected) |
| `/upload` | Homework photo upload (students only) |

### Security

- Teachers authenticate via Supabase Auth (email/password)
- Students use simple codes (no auth account needed)
- Row Level Security ensures teachers only see their own students
- Protected routes redirect unauthorized users

---

## Migration from V2

V3 uses Supabase instead of browser-only IndexedDB. Existing V2 data remains in the browser but is separate from the new cloud system.

**For existing users:**
- Teachers need to create a new account
- Students need to be re-added to get login codes
- Previous progress data is not automatically migrated

---

## What's Next (V4 Roadmap)

- Multi-language support (French)
- Placement test for automatic level detection
- Parent portal
- ClassDojo integration
- Voice input for younger students
