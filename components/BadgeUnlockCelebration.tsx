'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { rarityColors } from '@/lib/badges'

interface Badge {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  category: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  xpReward: number
}

interface BadgeUnlockCelebrationProps {
  badge: Badge | null
  onClose: () => void
}

// Confetti particle component
function Confetti({ delay }: { delay: number }) {
  const colors = ['#BB8CFC', '#C3FE4C', '#38BDF8', '#FACC15', '#FB7185', '#22C55E']
  const color = colors[Math.floor(Math.random() * colors.length)]
  const x = Math.random() * 100
  const rotation = Math.random() * 360

  return (
    <motion.div
      className="absolute w-3 h-3 rounded-sm"
      style={{
        backgroundColor: color,
        left: `${x}%`,
        top: '-10px'
      }}
      initial={{ y: 0, rotate: 0, opacity: 1 }}
      animate={{
        y: '100vh',
        rotate: rotation + 720,
        opacity: [1, 1, 0]
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay: delay,
        ease: 'easeIn'
      }}
    />
  )
}

export function BadgeUnlockCelebration({ badge, onClose }: BadgeUnlockCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    if (badge) {
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 5000)

      // Stop confetti after 3 seconds
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false)
      }, 3000)

      return () => {
        clearTimeout(timer)
        clearTimeout(confettiTimer)
      }
    }
  }, [badge, onClose])

  if (!badge) return null

  const colors = rarityColors[badge.rarity]

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Confetti */}
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <Confetti key={i} delay={i * 0.05} />
            ))}
          </div>
        )}

        {/* Badge Card */}
        <motion.div
          className="relative rounded-3xl p-8 max-w-sm mx-4 text-center"
          style={{
            backgroundColor: '#0F172A',
            border: `3px solid ${colors.border}`,
            boxShadow: `0 0 60px ${colors.bg}`
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', damping: 15 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow effect */}
          <div
            className="absolute inset-0 rounded-3xl opacity-30 blur-xl"
            style={{ backgroundColor: colors.border }}
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Badge unlocked text */}
            <motion.div
              className="mb-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span
                className="text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {badge.rarity} Badge Unlocked!
              </span>
            </motion.div>

            {/* Badge icon */}
            <motion.div
              className="text-8xl mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {badge.icon}
            </motion.div>

            {/* Badge name */}
            <motion.h2
              className="text-3xl font-bold mb-2"
              style={{ color: colors.text }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {badge.name}
            </motion.h2>

            {/* Badge description */}
            <motion.p
              className="mb-4"
              style={{ color: '#94A3B8' }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {badge.description}
            </motion.p>

            {/* XP Reward */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: 'rgba(250, 204, 21, 0.2)' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
            >
              <span className="text-xl">⭐</span>
              <span className="font-bold text-lg" style={{ color: '#FACC15' }}>
                +{badge.xpReward} XP
              </span>
            </motion.div>

            {/* Tap to continue */}
            <motion.p
              className="mt-6 text-sm"
              style={{ color: '#64748B' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5, 1] }}
              transition={{ delay: 1, duration: 2, repeat: Infinity }}
            >
              Tap anywhere to continue
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Badge display component for collections
export function BadgeDisplay({ badge, earned = false, size = 'md' }: {
  badge: Badge
  earned?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const colors = rarityColors[badge.rarity]
  const sizes = {
    sm: { container: 'w-16 h-16', icon: 'text-2xl', name: 'text-xs' },
    md: { container: 'w-24 h-24', icon: 'text-4xl', name: 'text-sm' },
    lg: { container: 'w-32 h-32', icon: 'text-6xl', name: 'text-base' }
  }

  return (
    <motion.div
      className={`${sizes[size].container} rounded-2xl flex flex-col items-center justify-center p-2 transition-all`}
      style={{
        backgroundColor: earned ? colors.bg : 'rgba(30, 41, 59, 0.5)',
        border: `2px solid ${earned ? colors.border : '#1E293B'}`,
        opacity: earned ? 1 : 0.4,
        filter: earned ? 'none' : 'grayscale(100%)'
      }}
      whileHover={earned ? { scale: 1.05 } : {}}
      title={`${badge.name}: ${badge.description}`}
    >
      <span className={sizes[size].icon}>{badge.icon}</span>
      <span
        className={`${sizes[size].name} font-medium text-center mt-1 leading-tight`}
        style={{ color: earned ? colors.text : '#64748B' }}
      >
        {badge.name}
      </span>
    </motion.div>
  )
}
