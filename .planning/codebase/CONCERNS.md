# Codebase Concerns

**Analysis Date:** 2026-01-26

## Tech Debt

**Dual Data Storage (Dexie + Supabase):**
- Issue: Both `lib/db.ts` (Dexie/IndexedDB) and `lib/supabase.ts` exist, creating data duplication and confusion about source of truth
- Files: `lib/db.ts`, `lib/supabase.ts`
- Impact: Data inconsistency risk; maintenance overhead; unclear which storage to use for new features
- Fix approach: Migrate all data operations to Supabase; deprecate `lib/db.ts`; remove Dexie dependency from `package.json`

**Prisma Client Installed But Unused:**
- Issue: `@prisma/client` and `prisma` are in `package.json` with a `prisma/` directory, but Supabase is the active database
- Files: `package.json`, `prisma/` directory
- Impact: Unnecessary dependencies; confusion about database strategy; build bloat
- Fix approach: Remove Prisma dependencies and `prisma/` directory if not planned for future use

**Placeholder Credentials Pattern:**
- Issue: Supabase client uses fallback placeholder values to avoid build errors, which masks configuration problems
- Files: `lib/supabase.ts` (lines 13-15)
- Impact: App silently fails instead of throwing clear errors when credentials missing; harder to debug deployments
- Fix approach: Throw clear error in development if credentials missing; use proper build-time environment validation

**Hardcoded Password Bypass:**
- Issue: Password "cynthia" is hardcoded in `Conversation.tsx` for unlimited access bypass
- Files: `components/Conversation.tsx` (line 194)
- Impact: Security risk in production; password visible in source code
- Fix approach: Remove hardcoded bypass; use proper subscription/license system; or move to environment variable for demos

**TypeScript `any` Type Usage:**
- Issue: API route uses `any` type for conversation history mapping
- Files: `app/api/chat/route.ts` (line 16)
- Impact: Loses type safety; potential runtime errors
- Fix approach: Define proper interface for message format; use typed mapping

## Known Bugs

**Answer Validation Too Permissive:**
- Symptoms: User saying "I think it's 13 but maybe 12" might trigger correct answer if "13" is anywhere in message
- Files: `lib/gemini.ts` (lines 151-158)
- Trigger: User mentioning multiple numbers including the correct answer
- Workaround: None currently
- Fix approach: Require more explicit answer confirmation; use AI to validate answer intent

**Message Counter Not Reset Between Problems:**
- Symptoms: Free trial message count persists across problems and sessions via localStorage
- Files: `components/Conversation.tsx` (lines 41-53)
- Trigger: Solve one problem, start another - counter doesn't reset
- Workaround: User can clear localStorage manually
- Fix approach: Reset counter per problem session or implement proper session management

## Security Considerations

**API Route Authentication:**
- Risk: `/api/students` GET uses only `x-teacher-id` header for auth without validating against Supabase session
- Files: `app/api/students/route.ts` (lines 17-19)
- Current mitigation: Middleware protects `/teacher` route, but API itself is vulnerable to direct calls
- Recommendations: Validate teacher ID against Supabase auth session in API routes; use proper JWT validation

**Student Login Codes:**
- Risk: 6-character alphanumeric codes may be brute-forceable; no rate limiting on `/api/auth/student`
- Files: `lib/supabase.ts` (lines 122-129), `app/api/auth/student/`
- Current mitigation: Codes exclude confusing characters (0,O,1,I)
- Recommendations: Add rate limiting; increase code length; add lockout after failed attempts

**Progress API No Authorization:**
- Risk: `/api/progress` accepts any studentId without validating the requestor owns that data
- Files: `app/api/progress/route.ts`
- Current mitigation: None
- Recommendations: Require student login session; validate student owns the progress being modified

**LocalStorage Session Data:**
- Risk: Student session stored in localStorage is easily manipulated by users
- Files: `components/SupabaseProvider.tsx` (lines 58-64), `app/page.tsx` (lines 59-70)
- Current mitigation: None
- Recommendations: Use Supabase session tokens; validate server-side on each request

**OCR Code Execution Risk:**
- Risk: `evaluateExpression` uses `Function()` constructor which is similar to `eval()`
- Files: `lib/ocr.ts` (lines 126-143)
- Current mitigation: Regex validation allows only digits and operators
- Recommendations: Use a proper math expression parser library instead

## Performance Bottlenecks

**Tesseract.js Bundle Size:**
- Problem: OCR library adds significant bundle size (~10MB for worker files)
- Files: `lib/ocr.ts`, `components/HomeworkUpload.tsx`
- Cause: Tesseract.js includes WASM worker files
- Improvement path: Lazy-load OCR only when needed; consider cloud OCR API for production

**No API Response Caching:**
- Problem: Student/progress data fetched on every page load
- Files: `app/page.tsx` (lines 55-104), `app/teacher/page.tsx` (lines 66-89)
- Cause: No SWR, React Query, or caching strategy
- Improvement path: Implement SWR or React Query for data fetching with caching

**Large Component File:**
- Problem: `app/teacher/page.tsx` is 801 lines; `app/page.tsx` is 540 lines
- Files: `app/teacher/page.tsx`, `app/page.tsx`
- Cause: All UI logic in single files
- Improvement path: Extract into smaller components; separate concerns into custom hooks

## Fragile Areas

**Conversation State Management:**
- Files: `components/Conversation.tsx`
- Why fragile: Complex state interactions (messages, loading, limits, unlocking); stream parsing with multiple edge cases
- Safe modification: Test all states (loading, error, limit reached, unlocked, completed)
- Test coverage: None - no tests exist in codebase

**Problem Filtering Logic:**
- Files: `app/page.tsx` (lines 167-213)
- Why fragile: Complex topic mapping with hardcoded fallbacks; multiple filter conditions
- Safe modification: Add comprehensive test cases for filter combinations
- Test coverage: None

**Stream Transform Logic:**
- Files: `lib/gemini.ts` (lines 111-149), `app/api/chat/route.ts` (lines 30-68)
- Why fragile: Two separate stream transformers (Ollama and CometAPI); different JSON formats to handle
- Safe modification: Add integration tests; test with both providers
- Test coverage: None

## Scaling Limits

**Supabase Row Level Security:**
- Current capacity: Works well for small classes
- Limit: Complex RLS policies may slow queries at scale; no pagination implemented
- Scaling path: Add pagination to student lists; optimize RLS policies; add database indexes

**LocalStorage for XP Goals:**
- Current capacity: Single browser per teacher
- Limit: XP goals don't sync across devices for teachers
- Scaling path: Store teacher settings in Supabase instead of localStorage (`app/teacher/page.tsx` lines 50-52, 97-108)

## Dependencies at Risk

**Next.js 16 (Beta/Canary):**
- Risk: Using very recent Next.js version (16.0.7) which may have unstable APIs
- Impact: Breaking changes between updates; less community support for issues
- Migration plan: Consider stable 15.x until 16 is fully released

**React 19:**
- Risk: React 19 is relatively new; some libraries may not be fully compatible
- Impact: Potential compatibility issues with Chakra UI or other dependencies
- Migration plan: Monitor for issues; consider React 18 for more stability

## Missing Critical Features

**No Test Suite:**
- Problem: Zero test files in the codebase (all `.test.*` files are in node_modules)
- Blocks: Confident refactoring; regression prevention; CI/CD quality gates
- Priority: High - critical for maintainability

**No Error Boundary:**
- Problem: No React error boundaries to catch and display errors gracefully
- Blocks: Good UX when errors occur; error reporting
- Priority: Medium

**No Logging/Monitoring:**
- Problem: Only `console.error` for errors; no structured logging or monitoring
- Blocks: Production debugging; usage analytics; error tracking
- Priority: Medium for production readiness

**No Rate Limiting:**
- Problem: API routes have no rate limiting
- Blocks: Protection against abuse; cost control for AI API calls
- Priority: High before production launch

## Test Coverage Gaps

**No Tests Exist:**
- What's not tested: Everything - no test files in project
- Files: All of `lib/`, `components/`, `app/`
- Risk: Any code change could break existing functionality undetected
- Priority: High - start with critical paths:
  1. `lib/gemini.ts` - answer checking logic
  2. `lib/supabase.ts` - database operations
  3. `lib/ocr.ts` - math expression parsing
  4. `components/Conversation.tsx` - message handling

---

*Concerns audit: 2026-01-26*
