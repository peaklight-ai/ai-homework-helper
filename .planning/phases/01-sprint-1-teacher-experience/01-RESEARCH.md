# Phase 1: Sprint 1 - Teacher Experience - Research

**Researched:** 2026-01-26
**Domain:** Class management, CSV import, email configuration, AI behavior modification
**Confidence:** HIGH

## Summary

This research covers the technical implementation details for Sprint 1: Teacher Experience, which includes class management (CLASS-01, CLASS-02, CLASS-03), student settings (SETTINGS-01), homework assignment (HW-01, HW-02), and two bug fixes (BUG-01, BUG-02).

The existing codebase has strong foundations: Supabase backend, Next.js 16 API routes, and a teacher dashboard. Prior research in `.planning/research/STACK.md` and `.planning/research/ARCHITECTURE.md` has already identified the recommended libraries (PapaParse, react-dropzone, Zod, TanStack Table) and database schema patterns.

This research focuses on **implementation specifics**: how to structure the code, what patterns to follow, and how to fix the identified bugs.

**Primary recommendation:** Build class management first (foundation), then CSV import, then exercise assignments. Fix both bugs as independent, low-risk tasks that can be done in parallel.

---

## Standard Stack

The established libraries/tools for this phase:

### Core (Already Researched)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **PapaParse** | ^5.4.x | CSV parsing | Fastest, no dependencies, handles malformed input |
| **react-dropzone** | ^14.x | File upload UI | De facto React standard, 14M+ weekly downloads |
| **Zod** | ^3.23.x | Schema validation | TypeScript-first, 35M+ weekly downloads |
| **TanStack Table** | ^8.x | Headless table logic | MIT, pairs with Chakra, lightweight |

### Supporting (New Additions)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@tanstack/react-table** | ^8.21.x | React bindings for TanStack Table | Class/student table views |
| **date-fns** | ^4.x | Date manipulation | Due dates for assignments |

### Not Adding

| Library | Why Not |
|---------|---------|
| **zod-csv** | Optional - standard Zod is sufficient with manual coercion |
| **xlsx/SheetJS** | Security vulnerabilities, CSV-only is fine for MVP |
| **@tremor/react** | Deferred to Phase 2 (analytics) - not needed for class management |

**Installation:**
```bash
npm install papaparse react-dropzone @tanstack/react-table date-fns
npm install -D @types/papaparse
```

---

## Architecture Patterns

### Recommended File Structure

```
app/
├── api/
│   ├── classes/
│   │   ├── route.ts              # GET (list), POST (create)
│   │   └── [id]/
│   │       ├── route.ts          # GET, PUT, DELETE single class
│   │       ├── students/
│   │       │   └── route.ts      # POST (enroll), DELETE (unenroll)
│   │       └── import/
│   │           └── route.ts      # POST (CSV bulk import)
│   └── exercises/
│       ├── route.ts              # GET, POST
│       ├── [id]/
│       │   └── route.ts          # GET, PUT, DELETE
│       └── assign/
│           └── route.ts          # POST (assign to class/students)
├── teacher/
│   ├── page.tsx                  # Existing dashboard (modify)
│   └── classes/
│       ├── page.tsx              # Class list view
│       └── [id]/
│           └── page.tsx          # Single class detail view
components/
├── ClassSelector.tsx             # Class dropdown/tabs for filtering
├── StudentTable.tsx              # TanStack Table for student list
├── CSVImportModal.tsx            # react-dropzone + PapaParse UI
├── ExerciseAssignmentForm.tsx    # Form for assigning exercises
lib/
├── csv-validation.ts             # Zod schemas for CSV import
├── supabase.ts                   # Add Class types (existing file)
```

### Pattern 1: Class-Scoped Student View

**What:** Students always viewed in context of a class, not flat list
**When:** Whenever displaying students in teacher dashboard
**Example:**

```typescript
// Instead of flat student list:
const students = await getStudentsByTeacher(teacherId)

// Use class-scoped queries:
const classes = await getClassesByTeacher(teacherId)
// Then for selected class:
const students = await getStudentsByClass(classId)

// Or with class info included:
const studentsWithClass = await supabase
  .from('class_students')
  .select(`
    *,
    students (*),
    classes (name, grade)
  `)
  .eq('classes.teacher_id', teacherId)
```

### Pattern 2: CSV Import with Preview

**What:** Parse CSV client-side, show preview with validation errors, then submit to server
**When:** Bulk student import
**Example:**

```typescript
// 1. Client-side parsing with PapaParse
import Papa from 'papaparse'
import { z } from 'zod'

const StudentRowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  grade: z.coerce.number().int().min(1).max(6),
})

function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validated = results.data.map((row, index) => {
          const result = StudentRowSchema.safeParse(row)
          return {
            rowNumber: index + 2, // +2 for header + 1-indexing
            data: row,
            valid: result.success,
            errors: result.success ? [] : result.error.errors.map(e => e.message)
          }
        })
        resolve({ rows: validated, meta: results.meta })
      }
    })
  })
}

// 2. Preview UI shows valid/invalid rows
// 3. User confirms, only valid rows sent to server
// 4. Server creates students and enrolls in class
```

### Pattern 3: Exercise Assignment Scope

**What:** Exercises can be assigned to class (all students) or individual students
**When:** Homework assignment (HW-01, HW-02)
**Example:**

```typescript
// Database constraint ensures at least one target
// CONSTRAINT target_required CHECK (class_id IS NOT NULL OR student_id IS NOT NULL)

interface AssignmentRequest {
  exerciseId: string
  // One of these required:
  classId?: string
  studentIds?: string[]
  // Optional metadata:
  dueDate?: string
  isRequired?: boolean
}

// API route handles both cases:
if (classId) {
  // Assign to entire class
  await createClassAssignment(exerciseId, classId, dueDate)
} else if (studentIds?.length) {
  // Assign to specific students
  await createStudentAssignments(exerciseId, studentIds, dueDate)
}
```

### Anti-Patterns to Avoid

- **Direct `class_id` on students table:** Use junction table `class_students` instead. Allows student in multiple classes, tracks enrollment date/status.
- **Flat student list in dashboard:** Always show class context. Use tabs/dropdown for class selection.
- **Server-side CSV parsing:** Parse client-side for instant feedback. Only send validated data to server.
- **Real-time validation on server:** Validate client-side with Zod, show errors before submission.

---

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSV parsing | String.split() with regex | PapaParse | Handles encoding, delimiters, quotes, malformed data |
| File drag-and-drop | Native HTML5 drag events | react-dropzone | Cross-browser, click fallback, file type validation |
| Data validation | Manual if/else checks | Zod | Type inference, composable, clear error messages |
| Table sorting/filtering | Manual array manipulation | TanStack Table | Headless, paginated, handles edge cases |
| Student import validation | Custom validation loop | Zod + PapaParse step callback | Row-by-row validation with errors per field |

**Key insight:** CSV import looks simple (split by comma) but edge cases include: quoted values with commas, escaped quotes, different line endings, BOM characters, encoding issues. PapaParse handles all of these.

---

## Common Pitfalls

### Pitfall 1: Email Goes to Spam (BUG-02)

**What goes wrong:** Supabase default SMTP sends from shared IP, often flagged as spam
**Why it happens:** Multiple Supabase projects share the same sending infrastructure
**How to avoid:**
1. Configure custom SMTP via Resend (recommended)
2. Set up SPF, DKIM, DMARC records for your domain
3. Customize email templates to remove spam trigger words

**Warning signs:** Users report not receiving confirmation/reset emails

**Fix approach (HIGH confidence):**
```
1. Create Resend account (free tier: 3,000 emails/month)
2. Verify your domain in Resend (add DNS records)
3. Supabase Dashboard > Project Settings > Auth > SMTP Settings
4. Enable Custom SMTP, enter Resend credentials:
   - Host: smtp.resend.com
   - Port: 465
   - Username: resend
   - Password: [API key from Resend]
   - Sender email: noreply@yourdomain.com
5. Customize email templates at Project Settings > Auth > Email Templates
```

**Sources:**
- [Supabase SMTP Docs](https://supabase.com/docs/guides/auth/auth-smtp)
- [Resend + Supabase Guide](https://resend.com/docs/send-with-supabase-smtp)

### Pitfall 2: AI Follows Up After Correct Answer (BUG-01)

**What goes wrong:** After student gets correct answer, AI asks follow-up questions instead of letting them try new problem
**Why it happens:** System prompt says to "guide with questions" without exception for completion state
**How to avoid:** Modify system prompt to explicitly stop after correct answer

**Fix approach (HIGH confidence):**

Current prompt in `lib/gemini.ts` (line 41):
```
9. IMPORTANT: When the student gives the CORRECT final answer (${context.problemAnswer}),
   say ONLY a brief congratulations like "Well done! You got it!" - DO NOT ask any
   follow-up questions, DO NOT ask them to explain, just celebrate and stop.
```

This rule exists but may not be strong enough. Reinforce with:
```typescript
// Add explicit termination instruction
const systemPrompt = `You are a Socratic tutor...

CRITICAL RULES:
...
9. COMPLETION RULE (HIGHEST PRIORITY): When the student gives the CORRECT final answer
   (${context.problemAnswer}), your ENTIRE response must be ONLY a celebration message
   like "Well done!" or "You got it!".
   - DO NOT ask follow-up questions
   - DO NOT ask them to explain their reasoning
   - DO NOT suggest trying harder problems
   - JUST celebrate briefly (1-2 sentences max) and STOP
   - After this message, the conversation is OVER for this problem

Remember: Celebrating and stopping is MORE helpful than asking follow-up questions.`
```

**Additionally:** Check if `isComplete` state in `Conversation.tsx` is being set correctly. When `isCorrect: true` comes from stream, input should be disabled and "Try Another Problem" shown. The bug may be in how the AI continues after marking correct.

### Pitfall 3: CSV Column Name Mismatch

**What goes wrong:** Teacher's CSV has "Student Name" but code expects "name"
**Why it happens:** Different spreadsheet conventions
**How to avoid:**
1. Normalize column headers (lowercase, remove spaces)
2. Support common variations
3. Show template download link

```typescript
// Normalize headers in PapaParse
Papa.parse(file, {
  transformHeader: (header) => {
    const normalized = header.toLowerCase().trim().replace(/\s+/g, '_')
    // Map common variations
    const aliases: Record<string, string> = {
      'student_name': 'name',
      'student': 'name',
      'full_name': 'name',
      'grade_level': 'grade',
      'class': 'grade',
    }
    return aliases[normalized] || normalized
  }
})
```

### Pitfall 4: Class Without Students Feels Broken

**What goes wrong:** Teacher creates class, sees empty state, thinks something's wrong
**Why it happens:** No guidance on next steps
**How to avoid:** Show clear empty state with action buttons

```tsx
{students.length === 0 ? (
  <EmptyState
    icon={<UsersIcon />}
    title="No students in this class yet"
    description="Add students one by one or import a CSV file"
    actions={[
      { label: "Add Student", onClick: () => setShowAddStudent(true) },
      { label: "Import CSV", onClick: () => setShowImportModal(true) },
      { label: "Download Template", href: "/templates/student-import.csv" }
    ]}
  />
) : (
  <StudentTable students={students} />
)}
```

---

## Code Examples

### CSV Import Component (Verified Pattern)

```typescript
// components/CSVImportModal.tsx
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { z } from 'zod'

const StudentRowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  grade: z.coerce.number().int().min(1).max(6),
})

type ParsedRow = {
  rowNumber: number
  data: Record<string, unknown>
  valid: boolean
  student?: z.infer<typeof StudentRowSchema>
  errors: string[]
}

interface CSVImportModalProps {
  classId: string
  onClose: () => void
  onImportComplete: () => void
}

export function CSVImportModal({ classId, onClose, onImportComplete }: CSVImportModalProps) {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.toLowerCase().trim().replace(/\s+/g, '_'),
      complete: (results) => {
        const validated = results.data.map((row, index) => {
          const result = StudentRowSchema.safeParse(row)
          return {
            rowNumber: index + 2,
            data: row as Record<string, unknown>,
            valid: result.success,
            student: result.success ? result.data : undefined,
            errors: result.success ? [] : result.error.errors.map(e => e.message)
          }
        })
        setParsedRows(validated)
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`)
      }
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1
  })

  const validRows = parsedRows.filter(r => r.valid)
  const invalidRows = parsedRows.filter(r => !r.valid)

  const handleImport = async () => {
    if (validRows.length === 0) return

    setIsImporting(true)
    try {
      const response = await fetch(`/api/classes/${classId}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: validRows.map(r => r.student)
        })
      })

      if (!response.ok) throw new Error('Import failed')

      onImportComplete()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="modal">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the CSV file here...</p>
        ) : (
          <p>Drag & drop a CSV file, or click to select</p>
        )}
      </div>

      {/* Preview */}
      {parsedRows.length > 0 && (
        <div className="preview">
          <p className="text-green-600">{validRows.length} valid rows</p>
          {invalidRows.length > 0 && (
            <p className="text-red-600">{invalidRows.length} invalid rows</p>
          )}

          {/* Show invalid rows with errors */}
          {invalidRows.map(row => (
            <div key={row.rowNumber} className="error-row">
              Row {row.rowNumber}: {row.errors.join(', ')}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="actions">
        <button onClick={onClose}>Cancel</button>
        <button
          onClick={handleImport}
          disabled={validRows.length === 0 || isImporting}
        >
          {isImporting ? 'Importing...' : `Import ${validRows.length} Students`}
        </button>
      </div>
    </div>
  )
}
```

### Database Schema Additions (From ARCHITECTURE.md)

```sql
-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  grade INTEGER CHECK (grade BETWEEN 1 AND 6),
  description TEXT,
  school_year TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_classes_teacher ON classes(teacher_id);

-- Class-student junction table
CREATE TABLE IF NOT EXISTS class_students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred')),
  UNIQUE(class_id, student_id)
);

CREATE INDEX idx_class_students_class ON class_students(class_id);
CREATE INDEX idx_class_students_student ON class_students(student_id);

-- RLS Policies
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage own classes" ON classes
  FOR ALL USING (teacher_id = auth.uid());

CREATE POLICY "Service role bypass classes" ON classes
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Teachers manage class enrollments" ON class_students
  FOR ALL USING (
    class_id IN (SELECT id FROM classes WHERE teacher_id = auth.uid())
  );

CREATE POLICY "Service role bypass class_students" ON class_students
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');
```

### API Route: Create Class

```typescript
// app/api/classes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  const teacherId = request.headers.get('x-teacher-id')

  if (!teacherId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: classes, error } = await supabase
    .from('classes')
    .select(`
      *,
      class_students (
        id,
        student_id,
        enrolled_at,
        students (id, name, grade, avatar_seed)
      )
    `)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform to include student count
  const transformed = classes?.map(c => ({
    ...c,
    studentCount: c.class_students?.length || 0,
    students: c.class_students?.map(cs => cs.students) || []
  }))

  return NextResponse.json({ classes: transformed })
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()
  const { teacherId, name, grade, description, schoolYear } = await request.json()

  if (!teacherId || !name) {
    return NextResponse.json(
      { error: 'Teacher ID and name are required' },
      { status: 400 }
    )
  }

  const { data: newClass, error } = await supabase
    .from('classes')
    .insert({
      teacher_id: teacherId,
      name,
      grade,
      description,
      school_year: schoolYear
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ class: newClass })
}
```

### TypeScript Types

```typescript
// Add to lib/supabase.ts

export interface Class {
  id: string
  teacher_id: string
  name: string
  grade: 1 | 2 | 3 | 4 | 5 | 6 | null
  description: string | null
  school_year: string | null
  created_at: string
  updated_at: string
}

export interface ClassStudent {
  id: string
  class_id: string
  student_id: string
  enrolled_at: string
  status: 'active' | 'inactive' | 'transferred'
}

export interface ClassWithStudents extends Class {
  studentCount: number
  students: Student[]
}

// For CSV import validation
export interface StudentImportRow {
  name: string
  grade: number
}

export interface CSVImportResult {
  success: boolean
  imported: number
  failed: number
  errors: Array<{ row: number; errors: string[] }>
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Direct student list | Class-scoped student views | Industry standard | Teachers can organize 100+ students |
| Manual CSV validation | Zod + PapaParse combo | 2024+ | Type-safe, better error messages |
| Server-side file parsing | Client-side preview | Modern SPAs | Instant feedback, less server load |
| Default Supabase SMTP | Custom SMTP (Resend) | Always recommended | Emails actually delivered |

**Deprecated/outdated:**
- Using `xlsx` npm package: Security vulnerabilities, unmaintained
- Flat student lists without class context: Doesn't scale
- Default Supabase email: Rate limited, spam filtered

---

## Open Questions

Things that couldn't be fully resolved:

1. **Student in Multiple Classes?**
   - What we know: Junction table supports this
   - What's unclear: Is this a real use case for the teacher?
   - Recommendation: Support it in database, but UI shows primary class only for now

2. **Existing Students During Import**
   - What we know: Can check for duplicate names
   - What's unclear: Should duplicates be updated, skipped, or error?
   - Recommendation: Skip duplicates by name within same class, show warning

3. **Class Archive vs Delete**
   - What we know: CASCADE delete removes enrollments
   - What's unclear: Should old classes be archived instead?
   - Recommendation: Soft delete (add `archived_at` column) if user requests, otherwise hard delete for MVP

---

## Sources

### Primary (HIGH confidence)
- [Supabase Auth SMTP Docs](https://supabase.com/docs/guides/auth/auth-smtp) - Email configuration
- [Resend + Supabase Integration](https://resend.com/docs/send-with-supabase-smtp) - SMTP setup steps
- [PapaParse Documentation](https://www.papaparse.com/docs) - CSV parsing API
- [react-dropzone Documentation](https://react-dropzone.js.org/) - File upload patterns
- [Zod Documentation](https://zod.dev/) - Schema validation
- [TanStack Table Documentation](https://tanstack.com/table/latest) - Table patterns

### Secondary (MEDIUM confidence)
- `.planning/research/STACK.md` - Prior library research (verified)
- `.planning/research/ARCHITECTURE.md` - Database schema design (verified)
- `.planning/codebase/ARCHITECTURE.md` - Existing system patterns (verified)

### Tertiary (LOW confidence)
- General web search for CSV import patterns (cross-verified with official docs)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries already vetted in prior research
- Database schema: HIGH - Schema designed in ARCHITECTURE.md
- BUG-01 fix: HIGH - System prompt modification, well-understood
- BUG-02 fix: HIGH - Standard Resend/SMTP configuration, documented
- CSV import pattern: HIGH - PapaParse + Zod is industry standard
- UI organization: MEDIUM - Based on UX patterns, may need iteration

**Research date:** 2026-01-26
**Valid until:** 2026-02-26 (30 days - stable libraries)
