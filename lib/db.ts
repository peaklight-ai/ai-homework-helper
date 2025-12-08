import Dexie, { Table } from 'dexie'

// Student Profile
export interface StudentProfile {
  id?: number
  name: string
  grade: 1 | 2 | 3 | 4 | 5 | 6
  avatarSeed: string
  createdAt: Date
}

// Student Progress (XP, streaks, etc.)
export interface StudentProgress {
  id?: number
  profileId: number
  totalXp: number
  level: number
  currentStreak: number
  longestStreak: number
  totalQuestions: number
  correctAnswers: number
}

// Class Settings (teacher-configurable)
export interface ClassSettings {
  id?: number
  xpGoal: number // XP goal per student
  xpDeadline: Date | null // Deadline for the goal
  dayEndTime: string // When does the school day end (e.g., "15:30" for 3:30 PM)
  updatedAt: Date
}

// Custom Problems (uploaded by teachers)
export type MathDomain =
  | 'number-operations'
  | 'algebraic-thinking'
  | 'geometry'
  | 'measurement'
  | 'data-handling'
  | 'problem-solving'

export interface CustomProblem {
  id?: number
  question: string
  answer: number | string
  difficulty: 1 | 2 | 3 | 4 | 5
  hint?: string
  domain: MathDomain
  gradeRange: [number, number]
  createdAt: Date
}

// Database class
export class HomeworkHelperDB extends Dexie {
  profiles!: Table<StudentProfile>
  progress!: Table<StudentProgress>
  customProblems!: Table<CustomProblem>
  settings!: Table<ClassSettings>

  constructor() {
    super('HomeworkHelperDB')
    this.version(2).stores({
      profiles: '++id, name, grade',
      progress: '++id, profileId',
      customProblems: '++id, domain, difficulty',
      settings: '++id'
    })
  }
}

export const db = new HomeworkHelperDB()

// Helper functions
export async function createProfile(name: string, grade: 1 | 2 | 3 | 4 | 5 | 6): Promise<number> {
  const avatarSeed = `${name}-${Date.now()}`
  const profileId = await db.profiles.add({
    name,
    grade,
    avatarSeed,
    createdAt: new Date()
  })

  // Create initial progress record
  await db.progress.add({
    profileId: profileId as number,
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    totalQuestions: 0,
    correctAnswers: 0
  })

  return profileId as number
}

export async function getActiveProfile(): Promise<StudentProfile | undefined> {
  const activeId = localStorage.getItem('activeProfileId')
  if (!activeId) return undefined
  return db.profiles.get(parseInt(activeId, 10))
}

export async function setActiveProfile(profileId: number): Promise<void> {
  localStorage.setItem('activeProfileId', profileId.toString())
}

export async function getProfileProgress(profileId: number): Promise<StudentProgress | undefined> {
  return db.progress.where('profileId').equals(profileId).first()
}

export async function addXp(profileId: number, xp: number): Promise<void> {
  const progress = await getProfileProgress(profileId)
  if (progress && progress.id) {
    const newXp = progress.totalXp + xp
    const newLevel = Math.floor(newXp / 500) + 1 // Level up every 500 XP
    await db.progress.update(progress.id, {
      totalXp: newXp,
      level: newLevel
    })
  }
}

export async function recordAnswer(profileId: number, isCorrect: boolean): Promise<void> {
  const progress = await getProfileProgress(profileId)
  if (progress && progress.id) {
    const newStreak = isCorrect ? progress.currentStreak + 1 : 0
    await db.progress.update(progress.id, {
      totalQuestions: progress.totalQuestions + 1,
      correctAnswers: progress.correctAnswers + (isCorrect ? 1 : 0),
      currentStreak: newStreak,
      longestStreak: Math.max(progress.longestStreak, newStreak)
    })
  }
}

// Export/Import for backup
export async function exportAllData(): Promise<string> {
  const profiles = await db.profiles.toArray()
  const progress = await db.progress.toArray()
  const customProblems = await db.customProblems.toArray()

  return JSON.stringify({
    profiles,
    progress,
    customProblems,
    exportedAt: new Date().toISOString()
  }, null, 2)
}

export async function importAllData(jsonString: string): Promise<void> {
  const data = JSON.parse(jsonString)

  // Clear existing data
  await db.profiles.clear()
  await db.progress.clear()
  await db.customProblems.clear()

  // Import new data
  if (data.profiles) await db.profiles.bulkAdd(data.profiles)
  if (data.progress) await db.progress.bulkAdd(data.progress)
  if (data.customProblems) await db.customProblems.bulkAdd(data.customProblems)
}

// Class Settings helpers
const DEFAULT_XP_GOAL = 100

const DEFAULT_DAY_END_TIME = '15:30' // 3:30 PM

export async function getClassSettings(): Promise<ClassSettings> {
  const settings = await db.settings.toCollection().first()
  if (!settings) {
    // Create default settings
    const id = await db.settings.add({
      xpGoal: DEFAULT_XP_GOAL,
      xpDeadline: null,
      dayEndTime: DEFAULT_DAY_END_TIME,
      updatedAt: new Date()
    })
    return { id: id as number, xpGoal: DEFAULT_XP_GOAL, xpDeadline: null, dayEndTime: DEFAULT_DAY_END_TIME, updatedAt: new Date() }
  }
  return settings
}

export async function updateClassSettings(xpGoal: number, xpDeadline: Date | null, dayEndTime: string): Promise<void> {
  const settings = await db.settings.toCollection().first()
  if (settings && settings.id) {
    await db.settings.update(settings.id, { xpGoal, xpDeadline, dayEndTime, updatedAt: new Date() })
  } else {
    await db.settings.add({ xpGoal, xpDeadline, dayEndTime, updatedAt: new Date() })
  }
}
