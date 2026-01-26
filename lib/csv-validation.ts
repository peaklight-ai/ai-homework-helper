import { z } from 'zod'

// CSV row schema - minimal fields only
export const StudentRowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  grade: z.coerce.number().int().min(1, 'Grade must be 1-6').max(6, 'Grade must be 1-6'),
})

export type StudentRow = z.infer<typeof StudentRowSchema>

// Header normalization - handle common variations
export function normalizeHeader(header: string): string {
  const normalized = header.toLowerCase().trim().replace(/\s+/g, '_')
  const aliases: Record<string, string> = {
    'student_name': 'name',
    'student': 'name',
    'full_name': 'name',
    'grade_level': 'grade',
    'class': 'grade',
    'year': 'grade',
  }
  return aliases[normalized] || normalized
}

// Parse result type
export interface ParsedRow {
  rowNumber: number
  data: Record<string, unknown>
  valid: boolean
  student?: StudentRow
  errors: string[]
}
