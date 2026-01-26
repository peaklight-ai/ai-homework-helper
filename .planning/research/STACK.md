# Technology Stack - Adaptive Learning Features

**Project:** Valid - AI Homework Helper
**Milestone:** Class Management, Diagnostic Tests, Student Analytics, Bulk Uploads
**Researched:** 2026-01-26
**Overall Confidence:** HIGH

## Executive Summary

This document covers the additional libraries and tools needed to implement:
1. Bulk CSV/Excel import for class lists
2. Diagnostic placement assessments with adaptive difficulty
3. Student strengths/weaknesses analytics and visualization
4. Class management and organization features

The existing stack (Next.js 16, React 19, Supabase, Chakra UI, Framer Motion) remains unchanged. These recommendations are additive.

---

## 1. Bulk Import (CSV/Excel Parsing)

### Recommended Stack

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **PapaParse** | ^5.4.x | CSV parsing | HIGH |
| **react-dropzone** | ^14.x | Drag-and-drop file upload UI | HIGH |
| **zod** | ^3.23.x | Schema validation for imported data | HIGH |
| **zod-csv** | ^0.4.x | CSV-specific Zod validation helpers | MEDIUM |

### Why PapaParse (Not xlsx/SheetJS)

**PapaParse is the clear winner for this use case:**

- **Performance:** Fastest CSV parser in benchmarks, even beating native `String.split`
- **Browser-first:** Works seamlessly in browser without Node.js dependencies
- **Auto-detection:** Automatically detects delimiters, handles malformed input gracefully
- **No security issues:** Unlike xlsx (SheetJS), which has known vulnerabilities (DoS, prototype pollution up to v0.19.2)
- **Web Workers support:** Multi-threading for large files without blocking UI
- **Zero dependencies:** Lightweight (~20KB minified)

**Why NOT xlsx (SheetJS):**
- Security vulnerabilities in npm-published versions
- xlsx package on npm is outdated and unmaintained
- Overkill for class lists (CSV is sufficient)
- Teachers can export Excel to CSV easily

**Sources:**
- [PapaParse Official](https://www.papaparse.com/)
- [npm-compare CSV libraries](https://npm-compare.com/csv-parse,csv-parser,fast-csv,papaparse)
- [LeanylAbs CSV Benchmarks](https://leanylabs.com/blog/js-csv-parsers-benchmarks/)

### Why react-dropzone

- De facto standard for drag-and-drop file uploads in React
- Returns file objects compatible with PapaParse
- Handles click-to-browse as fallback
- Small bundle (~10KB)
- Works with any file type (CSV, images for future features)

**Sources:**
- [react-dropzone GitHub](https://github.com/react-dropzone/react-dropzone)
- [react-dropzone npm](https://www.npmjs.com/package/react-dropzone)

### Why Zod + zod-csv

Zod provides TypeScript-first validation that catches bad data before it hits Supabase:

```typescript
import { z } from 'zod';
import * as zcsv from 'zod-csv';

const StudentImportSchema = z.object({
  name: zcsv.string().min(1, "Name is required"),
  grade: zcsv.number().int().min(1).max(6),
  class: zcsv.string().optional(),
});
```

- Type-safe validation with automatic TypeScript inference
- Clear error messages for teachers when import fails
- `safeParse()` for graceful error handling
- zod-csv handles CSV string-to-type coercion (e.g., "5" -> 5)

**Sources:**
- [Zod Official](https://zod.dev/)
- [zod-csv GitHub](https://github.com/bartoszgolebiowski/zod-csv)

### Installation

```bash
npm install papaparse react-dropzone zod zod-csv
npm install -D @types/papaparse
```

### What NOT to Use

| Library | Why Avoid |
|---------|-----------|
| **xlsx/SheetJS** | Security vulnerabilities, npm version unmaintained |
| **csv-parse** | Node.js focused, heavier than PapaParse |
| **fast-csv** | Streaming-focused, overkill for small class lists |

---

## 2. Diagnostic Assessment & Adaptive Learning

### Recommended Approach

| Component | Approach | Confidence |
|-----------|----------|------------|
| **Question Selection** | Difficulty bracketing algorithm (custom) | HIGH |
| **Mastery Tracking** | Simple competency model in Supabase | HIGH |
| **Spaced Repetition** | supermemo (SM-2) or custom simplified | MEDIUM |

### Why Custom Difficulty Bracketing (Not Full IRT)

**Full Item Response Theory (IRT) is overkill for MVP:**
- Requires pre-calibrated item parameters from large pilot studies
- Complex implementation (Bayesian inference, maximum likelihood estimation)
- No production-ready JavaScript IRT libraries exist
- pyBKT (Python) is the standard, but adds infrastructure complexity

**Recommended simplified approach:**

```typescript
// Simple adaptive algorithm for MVP
type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

interface DiagnosticState {
  currentDifficulty: DifficultyLevel;
  correctStreak: number;
  incorrectStreak: number;
  questionsAnswered: number;
}

function getNextDifficulty(state: DiagnosticState, wasCorrect: boolean): DifficultyLevel {
  if (wasCorrect) {
    // Move up after 2 correct in a row
    if (state.correctStreak >= 1 && state.currentDifficulty < 5) {
      return (state.currentDifficulty + 1) as DifficultyLevel;
    }
  } else {
    // Move down after 1 incorrect
    if (state.currentDifficulty > 1) {
      return (state.currentDifficulty - 1) as DifficultyLevel;
    }
  }
  return state.currentDifficulty;
}
```

This converges on student level in ~8-12 questions without complex statistics.

**Sources:**
- [IRT Wikipedia](https://en.wikipedia.org/wiki/Item_response_theory)
- [Bayesian Knowledge Tracing](https://en.wikipedia.org/wiki/Bayesian_Knowledge_Tracing)
- [pyBKT GitHub](https://github.com/CAHLR/pyBKT)

### Spaced Repetition Library

For tracking which concepts need review:

| Library | Why Consider | Decision |
|---------|-------------|----------|
| **supermemo** | Clean TypeScript SM-2 implementation | Recommended if needed |
| **sm2-plus** | Improved SM-2 variant | Alternative |
| **Custom** | Simpler for MVP needs | Default choice |

For MVP, a simplified approach may suffice:

```typescript
// Track last seen and correctness per topic
interface TopicMastery {
  topic: string;
  lastPracticed: Date;
  consecutiveCorrect: number;
  totalAttempts: number;
  correctAttempts: number;
}

// Review needed if: >3 days since practice OR <70% accuracy
function needsReview(mastery: TopicMastery): boolean {
  const daysSince = differenceInDays(new Date(), mastery.lastPracticed);
  const accuracy = mastery.correctAttempts / mastery.totalAttempts;
  return daysSince > 3 || accuracy < 0.7;
}
```

**Sources:**
- [supermemo npm](https://www.npmjs.com/supermemo)
- [SM-2 Algorithm Explanation](https://github.com/cnnrhill/sm-2)

### Installation (if using spaced repetition)

```bash
npm install supermemo
# OR implement custom (recommended for MVP)
```

---

## 3. Student Analytics & Visualization

### Recommended Stack

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **Tremor** | ^3.x | Dashboard charts and KPIs | HIGH |
| **date-fns** | ^4.x | Date manipulation for trends | HIGH |

### Why Tremor (Not Recharts/Victory Directly)

**Tremor is built on Recharts but provides:**

- Production-ready dashboard components (KPI cards, progress bars, area charts)
- Tailwind CSS integration (matches existing stack)
- Minimal configuration for common patterns
- Acquired by Vercel (strong future support)
- Accessibility and keyboard navigation built-in

**Perfect for:**
- Class overview stats (total XP, average accuracy, students at goal)
- Individual student progress charts
- Strengths/weaknesses visualization

**Comparison:**

| Feature | Tremor | Recharts | Victory |
|---------|--------|----------|---------|
| **Setup Time** | Minutes | Hours | Hours |
| **Tailwind Integration** | Native | Manual | Manual |
| **Dashboard Components** | KPIs, Trackers, Cards | Charts only | Charts only |
| **Customization** | Limited but sufficient | High | High |
| **Bundle Size** | ~30KB (includes Recharts) | ~30KB | ~40KB |

For teacher dashboards with predefined layouts, Tremor's opinionated components are ideal. If highly custom visualizations are needed later, drop down to Recharts directly (Tremor uses it internally).

**Sources:**
- [Tremor Official](https://www.tremor.so/)
- [Tremor acquired by Vercel](https://dev.to/sm0ke/tremor-free-react-library-for-dashboards-3gm9)
- [shadcn/ui Discussion on Charts](https://github.com/shadcn-ui/ui/discussions/4133)

### Why date-fns (Not dayjs/Moment)

**date-fns advantages:**
- Functional style (pure functions, immutable)
- Excellent tree-shaking (import only what you use)
- Fastest performance when working with native Date
- TypeScript-first
- Active development (v4 stable)

**Use for:**
- "Last 7 days" / "Last 30 days" analytics ranges
- "Days since last practice" calculations
- Formatting dates in teacher reports

**Comparison:**

| Feature | date-fns | dayjs | Moment |
|---------|----------|-------|--------|
| **Bundle Size** | ~3KB per function | ~2KB total | ~60KB |
| **Tree Shaking** | Excellent | Partial | None |
| **Style** | Functional | Chaining | Chaining |
| **Active** | Yes | Yes | Maintenance only |

**Sources:**
- [date-fns vs dayjs comparison](https://www.dhiwise.com/post/date-fns-vs-dayjs-the-battle-of-javascript-date-libraries)
- [npm-compare date libraries](https://npm-compare.com/date-fns,dayjs,moment)

### Installation

```bash
npm install @tremor/react date-fns
```

### Supabase Real-time for Live Dashboards

The existing `@supabase/supabase-js` already supports real-time subscriptions. No additional library needed.

```typescript
// Example: Live student progress updates
useEffect(() => {
  const channel = supabase
    .channel('progress-updates')
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'progress' },
      (payload) => {
        // Update dashboard in real-time
        setStudentProgress(prev => [...prev, payload.new]);
      }
    )
    .subscribe();

  return () => { channel.unsubscribe(); };
}, []);
```

**Sources:**
- [Supabase Realtime with Next.js](https://dev.to/lra8dev/building-real-time-magic-supabase-subscriptions-in-nextjs-15-2kmp)

---

## 4. Class Management (Data Tables)

### Recommended Stack

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **TanStack Table** | ^8.x | Headless table logic | HIGH |
| **Existing Chakra UI** | ^3.x | Table styling | HIGH (already installed) |

### Why TanStack Table (Not AG Grid)

**TanStack Table is the right choice because:**

- **MIT License:** Fully free, no enterprise split
- **Headless:** Provides sorting, filtering, pagination logic; you bring Chakra UI styling
- **Lightweight:** ~30KB vs AG Grid's 200KB+
- **Perfect fit for scale:** Valid will have ~100-1000 students per teacher, not millions
- **React-native path:** If mobile app needed later, TanStack supports React Native

**AG Grid would be overkill:**
- Enterprise features (pivot tables, Excel export) not needed
- Large bundle size impacts mobile performance
- Paid license required for advanced features

**Implementation approach:**

```typescript
import { useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import { Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';

// Use TanStack for logic, Chakra for rendering
const table = useReactTable({
  data: students,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
});
```

**Sources:**
- [TanStack Table vs AG Grid](https://www.simple-table.com/blog/tanstack-table-vs-ag-grid-comparison)
- [AG Grid Alternatives 2026](https://www.thefrontendcompany.com/posts/ag-grid-alternatives)

### Installation

```bash
npm install @tanstack/react-table
```

---

## 5. PDF Report Generation (Future Enhancement)

### Recommended Stack (Defer to Post-MVP)

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| **jsPDF** | ^2.5.x | PDF document creation | HIGH |
| **html2canvas** | ^1.4.x | HTML to canvas conversion | HIGH |
| **jspdf-autotable** | ^3.8.x | Table formatting in PDFs | MEDIUM |

### Why Defer

PDF reports (student progress reports, diagnostic results) are valuable but not critical for MVP. The existing teacher dashboard provides visibility.

If needed during MVP, the pattern is:

```typescript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

async function exportToPDF(elementId: string) {
  const element = document.getElementById(elementId);
  const canvas = await html2canvas(element);
  const pdf = new jsPDF();
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0);
  pdf.save('student-report.pdf');
}
```

**Limitations:** Text becomes an image (not searchable/selectable). For vector text, use `doc.html()` or server-side rendering.

**Sources:**
- [jsPDF GitHub](https://github.com/parallax/jsPDF)
- [html2canvas + jsPDF Tutorial](https://medium.com/@saidularefin8/generating-pdfs-from-html-in-a-react-application-with-html2canvas-and-jspdf-d46c5785eff2)

---

## Complete Installation Summary

### Required for MVP

```bash
# Bulk Import
npm install papaparse react-dropzone zod
npm install -D @types/papaparse

# Analytics Dashboard
npm install @tremor/react date-fns

# Class Management (Tables)
npm install @tanstack/react-table
```

### Optional (Defer to Post-MVP)

```bash
# Spaced Repetition (if implementing advanced review scheduling)
npm install supermemo

# PDF Export
npm install jspdf html2canvas jspdf-autotable
npm install -D @types/html2canvas

# Excel Import (only if CSV is insufficient)
npm install exceljs  # Prefer over xlsx due to security issues
```

---

## Database Schema Additions

These features require Supabase schema extensions:

```sql
-- Classes for organizing students
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade INTEGER CHECK (grade BETWEEN 1 AND 6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add class_id to students
ALTER TABLE students ADD COLUMN class_id UUID REFERENCES classes(id);

-- Diagnostic results
CREATE TABLE diagnostic_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  administered_at TIMESTAMPTZ DEFAULT NOW(),
  initial_level INTEGER CHECK (initial_level BETWEEN 1 AND 5),
  questions_answered INTEGER,
  results JSONB -- { topic: { correct: n, total: n } }
);

-- Topic mastery tracking
CREATE TABLE topic_mastery (
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  mastery_level REAL CHECK (mastery_level BETWEEN 0 AND 1),
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  last_practiced TIMESTAMPTZ,
  PRIMARY KEY (student_id, topic)
);
```

---

## What NOT to Install

| Library | Why Avoid |
|---------|-----------|
| **xlsx (SheetJS npm)** | Known security vulnerabilities, unmaintained |
| **moment.js** | Maintenance-only, large bundle, mutable API |
| **AG Grid** | Overkill for scale, large bundle, enterprise paywall |
| **Full IRT library** | No production JS implementation, requires calibrated items |
| **chart.js** | Lower-level than Tremor, more setup required |
| **Recharts** | Already included via Tremor; use Tremor's components |

---

## Confidence Assessment

| Area | Level | Reasoning |
|------|-------|-----------|
| CSV Parsing (PapaParse) | HIGH | Industry standard, benchmarked, no dependencies |
| File Upload (react-dropzone) | HIGH | De facto React standard, 14M weekly downloads |
| Validation (Zod) | HIGH | TypeScript-first, 35M weekly downloads, modern |
| Charts (Tremor) | HIGH | Vercel-backed, Tailwind-native, built on proven Recharts |
| Tables (TanStack) | HIGH | MIT license, headless flexibility, official AG Grid partner |
| Adaptive Algorithm | MEDIUM | Custom implementation; simple but may need tuning |
| Date handling (date-fns) | HIGH | Best tree-shaking, active maintenance |
| PDF Export | MEDIUM | Works but produces images, not vector text |

---

## Sources Summary

**CSV/File Handling:**
- [PapaParse](https://www.papaparse.com/)
- [react-dropzone](https://react-dropzone.js.org/)
- [Zod](https://zod.dev/)

**Analytics:**
- [Tremor](https://www.tremor.so/)
- [date-fns](https://date-fns.org/)

**Tables:**
- [TanStack Table](https://tanstack.com/table/)

**Adaptive Learning (Background):**
- [IRT Wikipedia](https://en.wikipedia.org/wiki/Item_response_theory)
- [supermemo npm](https://www.npmjs.com/supermemo)

---

*Stack research complete: 2026-01-26*
