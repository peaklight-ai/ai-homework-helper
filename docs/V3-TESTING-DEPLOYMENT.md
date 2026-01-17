# V3 Testing & Deployment Guide

## Prerequisites

Before testing, ensure Supabase is set up:

1. **Supabase Project** exists at: `https://bkmpojtkrhpfxoooqjfa.supabase.co`
2. **Database tables** created (run `supabase/schema.sql` in SQL Editor)
3. **Environment variables** in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://bkmpojtkrhpfxoooqjfa.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
   SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
   COMET_API_KEY=... (existing)
   ```

---

## Testing Checklist

### 1. Teacher Signup Flow

```bash
# Start dev server
npm run dev
```

1. Go to `http://localhost:3000/auth/signup`
2. Fill in:
   - Name: "Test Teacher"
   - Email: "test@example.com"
   - Password: "password123"
   - Confirm Password: "password123"
3. Click "Create Account"

**Expected:** Success message, redirect to `/teacher`

**Verify in Supabase:**
- Check `teachers` table has new record
- Check Supabase Auth > Users shows new user

---

### 2. Teacher Login Flow

1. Go to `http://localhost:3000/auth/login`
2. Enter email and password from signup
3. Click "Sign In"

**Expected:** Redirect to `/teacher` dashboard

---

### 3. Add Student Flow

1. On Teacher Dashboard, click "Add Student"
2. Enter:
   - Name: "Test Student"
   - Grade: 3
3. Click "Add Student"

**Expected:**
- Student appears in list with a 6-character code
- Code format: uppercase letters/numbers (e.g., "ABC123")

**Verify in Supabase:**
- Check `students` table has new record
- Check `progress` table has new record (initialized to 0)
- Check `student_settings` table has default settings

---

### 4. Student Login Flow

1. Copy the student's login code from teacher dashboard
2. Go to `http://localhost:3000` (main page)
3. Enter the 6-character code
4. Click "Let's Go!"

**Expected:**
- Student name and avatar appear
- Problem display loads
- XP progress shows

---

### 5. Student Settings Flow

1. On Teacher Dashboard, click gear icon next to student
2. Uncheck "Subtraction" and "Division"
3. Set difficulty to 2
4. Click "Save Settings"

**Expected:** Settings saved successfully

**Verify:**
- Log in as that student
- Start a problem
- Only Addition and Multiplication problems appear
- Numbers are appropriate for difficulty 2

---

### 6. Homework Upload Flow (OCR)

1. Log in as a student
2. Go to `http://localhost:3000/upload`
3. Click "Upload" and select an image with math (e.g., "5 + 3 = ?")
4. Click "Read Text"
5. Verify extracted text
6. Click "Solve It!"

**Expected:**
- OCR extracts text from image
- Math expression detected
- Problem loads in conversation mode

---

### 7. Progress Sync Flow

1. Log in as a student
2. Solve a problem correctly
3. Note the XP gained

**Verify in Supabase:**
- Check `progress` table shows updated XP
- Check `total_questions` incremented
- Check `correct_answers` incremented

**Cross-device test:**
- Log in as same student on different browser/device
- Progress should match

---

## Commit & Push

### Step 1: Check Status

```bash
cd "/Users/chadiabifadel/Files/PLAI/R&D - Scout Lab/tool_discovery/Prompting The A Team/Homework Helper AI/ai-homework-helper"

git status
```

### Step 2: Review Changes

```bash
git diff --stat
```

### Step 3: Stage All Changes

```bash
git add .
```

### Step 4: Commit

```bash
git commit -m "V3.0: Supabase auth, student codes, per-student settings, OCR upload

Features:
- Teacher email/password authentication (Supabase Auth)
- Student login with 6-character codes
- Per-student topic/difficulty settings
- Homework photo upload with Tesseract.js OCR
- Cloud progress sync

New files:
- lib/supabase.ts - Supabase client and helpers
- lib/ocr.ts - OCR processing
- components/SupabaseProvider.tsx - Auth context
- components/StudentLogin.tsx - Student login UI
- components/HomeworkUpload.tsx - Photo upload UI
- app/auth/login/page.tsx - Teacher login
- app/auth/signup/page.tsx - Teacher signup
- app/api/teachers/route.ts - Teacher API
- app/api/students/route.ts - Student CRUD API
- app/api/progress/route.ts - Progress API
- app/api/settings/route.ts - Settings API
- app/api/auth/student/route.ts - Student login API
- middleware.ts - Route protection
- supabase/schema.sql - Database schema

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Step 5: Push

```bash
git push origin main
```

---

## Vercel Deployment

### Add Environment Variables

In Vercel Dashboard > Settings > Environment Variables, add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://bkmpojtkrhpfxoooqjfa.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_...` |

### Deploy

Push to main triggers automatic deployment. Or manually:

```bash
vercel --prod
```

---

## Troubleshooting

### "Error creating teacher record"
- Check Supabase service role key is set correctly
- Verify `teachers` table exists with correct schema

### Student code not working
- Check `students` table has the code
- Codes are case-sensitive (all uppercase)

### OCR not extracting text
- Ensure image is clear and well-lit
- Tesseract works best with printed text
- Try a simpler image first

### Protected route redirecting
- Clear browser cookies
- Re-login as teacher
- Check middleware.ts is not blocking valid sessions
