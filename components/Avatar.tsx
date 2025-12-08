'use client'

interface AvatarProps {
  seed: string
  size?: number
  className?: string
}

// Using DiceBear's "adventurer" style with light skin tones for kid-friendly avatars
export function Avatar({ seed, size = 64, className = '' }: AvatarProps) {
  // Light skin tone options for the school
  const skinColors = 'f2d3b1,ffdbac,f5cfa0,eac393'
  const url = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&size=${size}&skinColor=${skinColors}`

  return (
    <img
      src={url}
      alt="Avatar"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      style={{ backgroundColor: '#f3f4f6' }}
    />
  )
}

// Avatar picker with different style options
const AVATAR_STYLES = [
  'adventurer',
  'adventurer-neutral',
  'avataaars',
  'big-ears',
  'big-smile',
  'bottts',
  'fun-emoji',
  'lorelei'
]

interface AvatarPickerProps {
  currentSeed: string
  onSelect: (seed: string) => void
}

export function AvatarPicker({ currentSeed, onSelect }: AvatarPickerProps) {
  // Generate 8 different avatar options based on the seed
  const options = Array.from({ length: 8 }, (_, i) => `${currentSeed}-option-${i}`)

  return (
    <div className="grid grid-cols-4 gap-3">
      {options.map((seed) => (
        <button
          key={seed}
          onClick={() => onSelect(seed)}
          className={`p-2 rounded-xl transition-all ${
            currentSeed === seed
              ? 'bg-purple-100 ring-2 ring-purple-500 scale-110'
              : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <Avatar seed={seed} size={48} />
        </button>
      ))}
    </div>
  )
}
