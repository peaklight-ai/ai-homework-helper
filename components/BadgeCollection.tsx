'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BadgeDisplay } from './BadgeUnlockCelebration'
import { rarityColors } from '@/lib/badges'

interface Badge {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  category: 'streak' | 'accuracy' | 'xp' | 'problems' | 'special'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  xpReward: number
}

interface StudentBadge extends Badge {
  earnedAt: string
  isNew: boolean
}

interface BadgeCollectionProps {
  studentId: string
  showAll?: boolean
}

const categoryLabels = {
  streak: { name: 'Streak', icon: '🔥' },
  accuracy: { name: 'Accuracy', icon: '🎯' },
  xp: { name: 'XP', icon: '⭐' },
  problems: { name: 'Problems', icon: '🧠' },
  special: { name: 'Special', icon: '🌟' }
}

export function BadgeCollection({ studentId, showAll = false }: BadgeCollectionProps) {
  const [earnedBadges, setEarnedBadges] = useState<StudentBadge[]>([])
  const [allBadges, setAllBadges] = useState<Badge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchBadges()
  }, [studentId])

  const fetchBadges = async () => {
    setIsLoading(true)
    try {
      // Fetch earned badges
      const earnedResponse = await fetch(`/api/badges?studentId=${studentId}`)
      if (earnedResponse.ok) {
        const data = await earnedResponse.json()
        setEarnedBadges(data.badges || [])
      }

      // Fetch all badges if showing collection
      if (showAll) {
        const allResponse = await fetch('/api/badges')
        if (allResponse.ok) {
          const data = await allResponse.json()
          setAllBadges(data.badges || [])
        }
      }
    } catch (error) {
      console.error('Error fetching badges:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const earnedBadgeIds = new Set(earnedBadges.map(b => b.id))

  // Badges to display
  const displayBadges = showAll ? allBadges : earnedBadges

  // Group by category
  const badgesByCategory = displayBadges.reduce((acc, badge) => {
    if (!acc[badge.category]) acc[badge.category] = []
    acc[badge.category].push(badge)
    return acc
  }, {} as Record<string, Badge[]>)

  // Filter by selected category
  const filteredCategories = selectedCategory
    ? { [selectedCategory]: badgesByCategory[selectedCategory] || [] }
    : badgesByCategory

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <motion.div
          className="w-12 h-12 rounded-full mx-auto mb-2"
          style={{ border: '3px solid #BB8CFC', borderTopColor: 'transparent' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <p style={{ color: '#94A3B8' }}>Loading badges...</p>
      </div>
    )
  }

  const totalEarned = earnedBadges.length
  const totalPossible = allBadges.length || earnedBadges.length

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: '#0F172A' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <h3 className="font-bold text-lg" style={{ color: '#F9FAFB' }}>Badge Collection</h3>
        </div>
        {showAll && (
          <span
            className="text-sm px-3 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(187, 140, 252, 0.2)', color: '#BB8CFC' }}
          >
            {totalEarned}/{totalPossible} Earned
          </span>
        )}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all"
          style={{
            backgroundColor: selectedCategory === null ? '#BB8CFC' : '#1E293B',
            color: selectedCategory === null ? '#1A1A1A' : '#94A3B8'
          }}
        >
          All
        </button>
        {Object.entries(categoryLabels).map(([key, { name, icon }]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1"
            style={{
              backgroundColor: selectedCategory === key ? '#BB8CFC' : '#1E293B',
              color: selectedCategory === key ? '#1A1A1A' : '#94A3B8'
            }}
          >
            <span>{icon}</span>
            {name}
          </button>
        ))}
      </div>

      {/* Badge Grid by Category */}
      <div className="space-y-6">
        {Object.entries(filteredCategories).map(([category, badges]) => {
          if (!badges || badges.length === 0) return null
          const { name, icon } = categoryLabels[category as keyof typeof categoryLabels] || { name: category, icon: '📦' }

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <span>{icon}</span>
                <h4 className="font-medium" style={{ color: '#94A3B8' }}>{name}</h4>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {badges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <BadgeDisplay
                      badge={badge}
                      earned={earnedBadgeIds.has(badge.id)}
                      size="md"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {Object.keys(filteredCategories).length === 0 && (
        <div className="text-center py-8">
          <span className="text-4xl block mb-2">🎯</span>
          <p style={{ color: '#94A3B8' }}>No badges yet</p>
          <p className="text-sm" style={{ color: '#64748B' }}>Keep practicing to earn your first badge!</p>
        </div>
      )}

      {/* Rarity Legend */}
      <div className="mt-6 pt-4" style={{ borderTop: '1px solid #1E293B' }}>
        <p className="text-xs mb-2" style={{ color: '#64748B' }}>Rarity:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(rarityColors).map(([rarity, colors]) => (
            <span
              key={rarity}
              className="text-xs px-2 py-1 rounded capitalize"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {rarity}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
