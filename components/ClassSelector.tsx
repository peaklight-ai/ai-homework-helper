'use client'

import { ClassWithStudents } from '@/lib/supabase'

interface ClassSelectorProps {
  classes: ClassWithStudents[]
  selectedClassId: string | null
  onSelectClass: (classId: string | null) => void
  onCreateClass: () => void
}

export function ClassSelector({
  classes,
  selectedClassId,
  onSelectClass,
  onCreateClass
}: ClassSelectorProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <select
        value={selectedClassId || ''}
        onChange={(e) => onSelectClass(e.target.value || null)}
        className="flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2"
        style={{
          backgroundColor: '#1E293B',
          color: '#F9FAFB',
          border: '1px solid #38BDF8'
        }}
      >
        <option value="">All Students</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.studentCount} students)
          </option>
        ))}
      </select>
      <button
        onClick={onCreateClass}
        className="px-3 py-2 rounded-lg font-medium transition-all hover:scale-105"
        style={{ backgroundColor: '#38BDF8', color: '#020617' }}
      >
        + Class
      </button>
    </div>
  )
}
