// Phase 7: Badge & Celebration System
// Tracks achievements and unlocks badges

import { createServerSupabaseClient } from './supabase'

export interface Badge {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  category: 'streak' | 'accuracy' | 'xp' | 'problems' | 'special'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  xpReward: number
}

export interface StudentBadge extends Badge {
  earnedAt: string
  isNew: boolean
}

export interface BadgeUnlock {
  badge: Badge
  xpAwarded: number
}

// Check and unlock any new badges for a student
export async function checkAndUnlockBadges(studentId: string): Promise<BadgeUnlock[]> {
  const supabase = createServerSupabaseClient()
  const unlockedBadges: BadgeUnlock[] = []

  // Get student progress
  const { data: progressData, error: progressError } = await supabase
    .from('progress')
    .select('*')
    .eq('student_id', studentId)
    .single()

  if (progressError || !progressData) {
    console.error('Error fetching progress:', progressError)
    return []
  }

  // Get all badge definitions
  const { data: badges, error: badgesError } = await supabase
    .from('badge_definitions')
    .select('*')

  if (badgesError || !badges) {
    console.error('Error fetching badges:', badgesError)
    return []
  }

  // Get already earned badges
  const { data: earnedBadges } = await supabase
    .from('student_badges')
    .select('badge_id')
    .eq('student_id', studentId)

  const earnedBadgeIds = new Set((earnedBadges || []).map(b => b.badge_id))

  // Check each badge
  for (const badge of badges) {
    if (earnedBadgeIds.has(badge.id)) continue

    let earned = false
    const reqType = badge.requirement_type
    const reqValue = badge.requirement_value

    switch (reqType) {
      case 'current_streak':
        earned = (progressData.current_streak || 0) >= reqValue
        break
      case 'total_xp':
        earned = (progressData.total_xp || 0) >= reqValue
        break
      case 'total_questions':
        earned = (progressData.total_questions || 0) >= reqValue
        break
      case 'consecutive_correct':
        earned = (progressData.consecutive_correct || 0) >= reqValue
        break
      case 'level':
        earned = (progressData.level || 1) >= reqValue
        break
      case 'early_practice':
      case 'night_practice':
        // Special time-based badges - checked separately
        break
    }

    if (earned) {
      // Award the badge
      const { error: insertError } = await supabase
        .from('student_badges')
        .insert({
          student_id: studentId,
          badge_id: badge.id
        })

      if (!insertError) {
        // Award XP for the badge
        await supabase
          .from('progress')
          .update({
            total_xp: (progressData.total_xp || 0) + badge.xp_reward
          })
          .eq('student_id', studentId)

        unlockedBadges.push({
          badge: {
            id: badge.id,
            slug: badge.slug,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            category: badge.category,
            rarity: badge.rarity,
            xpReward: badge.xp_reward
          },
          xpAwarded: badge.xp_reward
        })

        // Log celebration
        await supabase.from('celebrations').insert({
          student_id: studentId,
          celebration_type: 'badge_unlocked',
          celebration_data: {
            badgeSlug: badge.slug,
            badgeName: badge.name,
            badgeIcon: badge.icon,
            rarity: badge.rarity
          }
        })
      }
    }
  }

  return unlockedBadges
}

// Get all badges for a student
export async function getStudentBadges(studentId: string): Promise<StudentBadge[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('student_badges')
    .select(`
      earned_at,
      seen_at,
      badge_definitions (
        id,
        slug,
        name,
        description,
        icon,
        category,
        rarity,
        xp_reward
      )
    `)
    .eq('student_id', studentId)
    .order('earned_at', { ascending: false })

  if (error || !data) {
    console.error('Error fetching student badges:', error)
    return []
  }

  return data.map(item => {
    const badge = item.badge_definitions as any
    return {
      id: badge.id,
      slug: badge.slug,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      rarity: badge.rarity,
      xpReward: badge.xp_reward,
      earnedAt: item.earned_at,
      isNew: !item.seen_at
    }
  })
}

// Mark badges as seen
export async function markBadgesSeen(studentId: string, badgeIds: string[]): Promise<void> {
  const supabase = createServerSupabaseClient()

  await supabase
    .from('student_badges')
    .update({ seen_at: new Date().toISOString() })
    .eq('student_id', studentId)
    .in('badge_id', badgeIds)
}

// Get all available badges (for display)
export async function getAllBadges(): Promise<Badge[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('badge_definitions')
    .select('*')
    .order('requirement_value', { ascending: true })

  if (error || !data) {
    return []
  }

  return data.map(b => ({
    id: b.id,
    slug: b.slug,
    name: b.name,
    description: b.description,
    icon: b.icon,
    category: b.category,
    rarity: b.rarity,
    xpReward: b.xp_reward
  }))
}

// Rarity colors for UI
export const rarityColors = {
  common: { bg: 'rgba(148, 163, 184, 0.2)', border: '#94A3B8', text: '#94A3B8' },
  uncommon: { bg: 'rgba(34, 197, 94, 0.2)', border: '#22C55E', text: '#22C55E' },
  rare: { bg: 'rgba(56, 189, 248, 0.2)', border: '#38BDF8', text: '#38BDF8' },
  epic: { bg: 'rgba(187, 140, 252, 0.2)', border: '#BB8CFC', text: '#BB8CFC' },
  legendary: { bg: 'rgba(250, 204, 21, 0.2)', border: '#FACC15', text: '#FACC15' }
}
