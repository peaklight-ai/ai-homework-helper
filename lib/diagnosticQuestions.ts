// =============================================================================
// DIAGNOSTIC QUESTIONS BY GRADE
// =============================================================================
// Each grade has questions across domains at varying difficulty levels.
// Diagnostic starts at medium (3) and adapts based on responses.
// =============================================================================

export interface DiagnosticQuestionData {
  grade: 1 | 2 | 3 | 4 | 5 | 6
  domain: string
  difficulty: 1 | 2 | 3 | 4 | 5
  question: string
  answer: string
  hints: string[]
}

export const diagnosticQuestions: DiagnosticQuestionData[] = [
  // ==========================================================================
  // GRADE 1 (Ages 6-7) - Concrete story problems, solve together
  // ==========================================================================
  // Addition
  { grade: 1, domain: 'addition', difficulty: 1, question: 'What is 2 + 1?', answer: '3', hints: ['Count on your fingers: 2... then 1 more'] },
  { grade: 1, domain: 'addition', difficulty: 2, question: 'What is 4 + 3?', answer: '7', hints: ['Start at 4 and count up 3 more'] },
  { grade: 1, domain: 'addition', difficulty: 3, question: 'What is 6 + 5?', answer: '11', hints: ['6 + 4 = 10, then add 1 more'] },
  { grade: 1, domain: 'addition', difficulty: 4, question: 'What is 8 + 7?', answer: '15', hints: ['8 + 2 = 10, then add 5 more'] },
  { grade: 1, domain: 'addition', difficulty: 5, question: 'What is 9 + 8?', answer: '17', hints: ['9 + 1 = 10, then add 7 more'] },

  // Subtraction
  { grade: 1, domain: 'subtraction', difficulty: 1, question: 'What is 3 - 1?', answer: '2', hints: ['If you have 3 apples and eat 1...'] },
  { grade: 1, domain: 'subtraction', difficulty: 2, question: 'What is 7 - 3?', answer: '4', hints: ['Count back from 7: 6, 5, 4'] },
  { grade: 1, domain: 'subtraction', difficulty: 3, question: 'What is 10 - 4?', answer: '6', hints: ['What plus 4 equals 10?'] },
  { grade: 1, domain: 'subtraction', difficulty: 4, question: 'What is 12 - 5?', answer: '7', hints: ['12 - 2 = 10, then take away 3 more'] },
  { grade: 1, domain: 'subtraction', difficulty: 5, question: 'What is 15 - 8?', answer: '7', hints: ['15 - 5 = 10, then take away 3 more'] },

  // ==========================================================================
  // GRADE 2 (Ages 7-8) - One-step problems, teach steps and language
  // ==========================================================================
  // Addition
  { grade: 2, domain: 'addition', difficulty: 1, question: 'What is 12 + 5?', answer: '17', hints: ['Add the ones first'] },
  { grade: 2, domain: 'addition', difficulty: 2, question: 'What is 23 + 14?', answer: '37', hints: ['20 + 10 = 30, then 3 + 4 = 7'] },
  { grade: 2, domain: 'addition', difficulty: 3, question: 'What is 38 + 25?', answer: '63', hints: ['30 + 20 = 50, 8 + 5 = 13, so 50 + 13 = ?'] },
  { grade: 2, domain: 'addition', difficulty: 4, question: 'What is 47 + 36?', answer: '83', hints: ['40 + 30 = 70, 7 + 6 = 13'] },
  { grade: 2, domain: 'addition', difficulty: 5, question: 'What is 58 + 67?', answer: '125', hints: ['50 + 60 = 110, 8 + 7 = 15'] },

  // Subtraction
  { grade: 2, domain: 'subtraction', difficulty: 1, question: 'What is 18 - 5?', answer: '13', hints: ['Subtract the ones'] },
  { grade: 2, domain: 'subtraction', difficulty: 2, question: 'What is 34 - 12?', answer: '22', hints: ['30 - 10 = 20, 4 - 2 = 2'] },
  { grade: 2, domain: 'subtraction', difficulty: 3, question: 'What is 52 - 28?', answer: '24', hints: ['52 - 30 = 22, then add back 2'] },
  { grade: 2, domain: 'subtraction', difficulty: 4, question: 'What is 73 - 45?', answer: '28', hints: ['73 - 40 = 33, then subtract 5'] },
  { grade: 2, domain: 'subtraction', difficulty: 5, question: 'What is 91 - 56?', answer: '35', hints: ['91 - 50 = 41, then subtract 6'] },

  // Multiplication (intro)
  { grade: 2, domain: 'multiplication', difficulty: 1, question: 'What is 2 × 3?', answer: '6', hints: ['2 groups of 3: 3 + 3 = ?'] },
  { grade: 2, domain: 'multiplication', difficulty: 2, question: 'What is 3 × 4?', answer: '12', hints: ['3 groups of 4'] },
  { grade: 2, domain: 'multiplication', difficulty: 3, question: 'What is 5 × 5?', answer: '25', hints: ['Skip count by 5s: 5, 10, 15, 20, ?'] },

  // ==========================================================================
  // GRADE 3 (Ages 8-9) - Multi-step strategies, model and scaffold
  // ==========================================================================
  // Addition/Subtraction
  { grade: 3, domain: 'addition', difficulty: 3, question: 'What is 234 + 178?', answer: '412', hints: ['Add hundreds, tens, ones separately'] },
  { grade: 3, domain: 'subtraction', difficulty: 3, question: 'What is 503 - 247?', answer: '256', hints: ['You may need to borrow'] },

  // Multiplication
  { grade: 3, domain: 'multiplication', difficulty: 1, question: 'What is 4 × 6?', answer: '24', hints: ['4 × 5 = 20, then add one more 4'] },
  { grade: 3, domain: 'multiplication', difficulty: 2, question: 'What is 7 × 8?', answer: '56', hints: ['7 × 8 = 56 (5, 6, 7, 8)'] },
  { grade: 3, domain: 'multiplication', difficulty: 3, question: 'What is 9 × 7?', answer: '63', hints: ['10 × 7 = 70, minus 7'] },
  { grade: 3, domain: 'multiplication', difficulty: 4, question: 'What is 12 × 6?', answer: '72', hints: ['10 × 6 = 60, 2 × 6 = 12'] },
  { grade: 3, domain: 'multiplication', difficulty: 5, question: 'What is 15 × 8?', answer: '120', hints: ['15 × 8 = (10 × 8) + (5 × 8)'] },

  // Division
  { grade: 3, domain: 'division', difficulty: 1, question: 'What is 12 ÷ 3?', answer: '4', hints: ['How many 3s in 12?'] },
  { grade: 3, domain: 'division', difficulty: 2, question: 'What is 24 ÷ 4?', answer: '6', hints: ['4 × ? = 24'] },
  { grade: 3, domain: 'division', difficulty: 3, question: 'What is 42 ÷ 7?', answer: '6', hints: ['7 × 6 = ?'] },
  { grade: 3, domain: 'division', difficulty: 4, question: 'What is 56 ÷ 8?', answer: '7', hints: ['8 × 7 = 56'] },
  { grade: 3, domain: 'division', difficulty: 5, question: 'What is 81 ÷ 9?', answer: '9', hints: ['9 × 9 = ?'] },

  // ==========================================================================
  // GRADE 4 (Ages 9-10) - Independent reasoning, coach and extend
  // ==========================================================================
  // Multiplication
  { grade: 4, domain: 'multiplication', difficulty: 2, question: 'What is 23 × 4?', answer: '92', hints: ['20 × 4 = 80, 3 × 4 = 12'] },
  { grade: 4, domain: 'multiplication', difficulty: 3, question: 'What is 36 × 7?', answer: '252', hints: ['30 × 7 = 210, 6 × 7 = 42'] },
  { grade: 4, domain: 'multiplication', difficulty: 4, question: 'What is 45 × 12?', answer: '540', hints: ['45 × 10 = 450, 45 × 2 = 90'] },
  { grade: 4, domain: 'multiplication', difficulty: 5, question: 'What is 67 × 23?', answer: '1541', hints: ['Use the standard algorithm'] },

  // Division
  { grade: 4, domain: 'division', difficulty: 2, question: 'What is 84 ÷ 7?', answer: '12', hints: ['7 × 10 = 70, 7 × 2 = 14'] },
  { grade: 4, domain: 'division', difficulty: 3, question: 'What is 144 ÷ 12?', answer: '12', hints: ['12 × 12 = ?'] },
  { grade: 4, domain: 'division', difficulty: 4, question: 'What is 256 ÷ 8?', answer: '32', hints: ['8 × 30 = 240, 8 × 2 = 16'] },
  { grade: 4, domain: 'division', difficulty: 5, question: 'What is 391 ÷ 17?', answer: '23', hints: ['Try 17 × 20 first'] },

  // Addition/Subtraction (larger)
  { grade: 4, domain: 'addition', difficulty: 3, question: 'What is 1,234 + 2,567?', answer: '3801', hints: ['Add from right to left, carrying when needed'] },
  { grade: 4, domain: 'subtraction', difficulty: 3, question: 'What is 5,000 - 1,234?', answer: '3766', hints: ['Borrow from each place'] },

  // ==========================================================================
  // GRADE 5 (Ages 10-11) - Independent reasoning, coach and extend
  // ==========================================================================
  // All operations
  { grade: 5, domain: 'multiplication', difficulty: 3, question: 'What is 125 × 16?', answer: '2000', hints: ['125 × 8 = 1000, then double'] },
  { grade: 5, domain: 'multiplication', difficulty: 4, question: 'What is 234 × 56?', answer: '13104', hints: ['Use partial products'] },
  { grade: 5, domain: 'division', difficulty: 3, question: 'What is 1440 ÷ 45?', answer: '32', hints: ['45 × 30 = 1350'] },
  { grade: 5, domain: 'division', difficulty: 4, question: 'What is 2856 ÷ 68?', answer: '42', hints: ['68 × 40 = 2720'] },

  // Fractions
  { grade: 5, domain: 'addition', difficulty: 3, question: 'What is 3/4 + 1/4?', answer: '1', hints: ['Same denominator, add numerators'] },
  { grade: 5, domain: 'addition', difficulty: 4, question: 'What is 2/3 + 1/6?', answer: '5/6', hints: ['Find common denominator: 6'] },
  { grade: 5, domain: 'multiplication', difficulty: 4, question: 'What is 3/4 × 2/5?', answer: '3/10', hints: ['Multiply numerators, multiply denominators'] },
  { grade: 5, domain: 'subtraction', difficulty: 4, question: 'What is 5/6 - 1/3?', answer: '1/2', hints: ['Convert 1/3 to sixths: 2/6'] },

  // ==========================================================================
  // GRADE 6 (Ages 11-12) - Independent reasoning, coach and extend
  // ==========================================================================
  { grade: 6, domain: 'multiplication', difficulty: 3, question: 'What is 0.25 × 80?', answer: '20', hints: ['0.25 = 1/4, so divide by 4'] },
  { grade: 6, domain: 'multiplication', difficulty: 4, question: 'What is 15% of 240?', answer: '36', hints: ['10% = 24, 5% = 12'] },
  { grade: 6, domain: 'division', difficulty: 4, question: 'What is 7.2 ÷ 0.9?', answer: '8', hints: ['Multiply both by 10: 72 ÷ 9'] },
  { grade: 6, domain: 'addition', difficulty: 4, question: 'Solve: x + 7 = 15', answer: '8', hints: ['Subtract 7 from both sides'] },
  { grade: 6, domain: 'multiplication', difficulty: 5, question: 'Solve: 3x + 7 = 22', answer: '5', hints: ['Subtract 7, then divide by 3'] },
  { grade: 6, domain: 'division', difficulty: 5, question: 'What is 2.5 × 3.2?', answer: '8', hints: ['25 × 32 = 800, then place decimal'] },
]

// Get questions for a specific grade
export function getQuestionsByGrade(grade: number): DiagnosticQuestionData[] {
  return diagnosticQuestions.filter(q => q.grade === grade)
}

// Get questions for a grade and domain
export function getQuestionsByGradeAndDomain(grade: number, domain: string): DiagnosticQuestionData[] {
  return diagnosticQuestions.filter(q => q.grade === grade && q.domain === domain)
}

// Get adaptive next question based on performance
export function getAdaptiveQuestion(
  grade: number,
  domain: string,
  currentDifficulty: number,
  wasCorrect: boolean
): DiagnosticQuestionData | null {
  const newDifficulty = wasCorrect
    ? Math.min(5, currentDifficulty + 1)
    : Math.max(1, currentDifficulty - 1)

  const candidates = diagnosticQuestions.filter(
    q => q.grade === grade && q.domain === domain && q.difficulty === newDifficulty
  )

  if (candidates.length === 0) return null
  return candidates[Math.floor(Math.random() * candidates.length)]
}

// Calculate recommended difficulty level from diagnostic results
export function calculateRecommendedLevel(
  results: Array<{ difficulty: number; isCorrect: boolean }>
): number {
  if (results.length === 0) return 3 // Default to medium

  // Find the highest difficulty where student got 60%+ correct
  const byDifficulty = new Map<number, { correct: number; total: number }>()

  for (const r of results) {
    const current = byDifficulty.get(r.difficulty) || { correct: 0, total: 0 }
    current.total++
    if (r.isCorrect) current.correct++
    byDifficulty.set(r.difficulty, current)
  }

  let recommendedLevel = 1
  for (let d = 1; d <= 5; d++) {
    const stats = byDifficulty.get(d)
    if (stats && stats.correct / stats.total >= 0.6) {
      recommendedLevel = d
    }
  }

  return recommendedLevel
}

// Get domains for a grade
export function getDomainsForGrade(grade: number): string[] {
  const questions = getQuestionsByGrade(grade)
  return [...new Set(questions.map(q => q.domain))]
}
