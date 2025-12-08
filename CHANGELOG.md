# Changelog

All notable changes to AI Homework Helper will be documented in this file.

## [2.0.0] - 2025-12-08

### Bug Fixes
- Fix input blocked after correct answer - now shows "Try Another Problem" button immediately
- Fix overly positive AI responses on mistakes - AI now gives neutral feedback for wrong answers
- Fix AI asking follow-up questions after correct answers - now just congratulates
- Hide topic labels from students - removed topic display from problem card
- Fix "Try Another Problem" reloading entire page - now uses callback to stay in session

### New Features
- **Student Profiles** - Create and manage student profiles with name, grade, avatar
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

## Version 2.0 (Current Focus)
- Bug fixes from demo feedback
- Student profiles (browser-based)
- Custom question upload
- Expanded math domains

## Version 3.0 (Future)
**Database Integration**

- **Server Database** - Supabase or Vercel Postgres for cross-device sync
- **Teacher Dashboard** - View student progress, assign problems
- **Parent Portal** - Monitor child's learning
- **Image Upload (OCR)** - Tesseract.js to extract problems from homework photos
- **Voice Input** - Record voice messages for younger students

## Version 4.0 (Vision)
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
| [Tesseract.js](https://github.com/naptha/tesseract.js) | OCR for homework photos | V3 Roadmap |
| [MathLive](https://github.com/arnog/mathlive) | Math input keyboard | V3 Roadmap |
