'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { motion } from 'framer-motion'
import { StudentRowSchema, normalizeHeader, ParsedRow } from '@/lib/csv-validation'

interface CSVImportModalProps {
  classId: string
  className: string
  onClose: () => void
  onImportComplete: () => void
}

export function CSVImportModal({
  classId,
  className,
  onClose,
  onImportComplete
}: CSVImportModalProps) {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setError(null)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: normalizeHeader,
      complete: (results) => {
        const validated = results.data.map((row, index) => {
          const result = StudentRowSchema.safeParse(row)
          return {
            rowNumber: index + 2, // +2 for header + 1-indexing
            data: row as Record<string, unknown>,
            valid: result.success,
            student: result.success ? result.data : undefined,
            errors: result.success ? [] : result.error.issues.map(e => e.message)
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
    setError(null)
    try {
      const response = await fetch(`/api/classes/${classId}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: validRows.map(r => r.student)
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Import failed')
      }

      onImportComplete()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        className="w-full max-w-lg mx-4 rounded-xl p-6 max-h-[80vh] overflow-y-auto"
        style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2 className="text-xl font-bold mb-2" style={{ color: '#F9FAFB' }}>
          Import Students to {className}
        </h2>

        {/* CSV format explanation */}
        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#1E293B' }}>
          <p className="text-sm font-medium mb-2" style={{ color: '#F9FAFB' }}>
            CSV Format:
          </p>
          <div className="text-xs space-y-1" style={{ color: '#94A3B8' }}>
            <p><strong style={{ color: '#38BDF8' }}>name</strong> — Student's full name</p>
            <p><strong style={{ color: '#38BDF8' }}>grade</strong> — Student's grade level (1-6), used to match problem difficulty</p>
          </div>
          <p className="text-xs mt-2" style={{ color: '#64748B' }}>
            Example: Emma Johnson, 3
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="mb-4 p-3 rounded-lg"
            style={{ backgroundColor: 'rgba(251, 113, 133, 0.1)', border: '1px solid #FB7185' }}
          >
            <p style={{ color: '#FB7185' }}>{error}</p>
          </div>
        )}

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className="p-8 rounded-lg border-2 border-dashed cursor-pointer transition-all mb-4"
          style={{
            backgroundColor: isDragActive ? 'rgba(56, 189, 248, 0.1)' : '#1E293B',
            borderColor: isDragActive ? '#38BDF8' : '#64748B'
          }}
        >
          <input {...getInputProps()} />
          <p className="text-center" style={{ color: '#94A3B8' }}>
            {isDragActive
              ? 'Drop the CSV file here...'
              : 'Drag & drop a CSV file, or click to select'}
          </p>
        </div>

        {/* Preview */}
        {parsedRows.length > 0 && (
          <div className="mb-4">
            <div className="flex gap-4 mb-3">
              <p style={{ color: '#22C55E' }}>{validRows.length} valid</p>
              {invalidRows.length > 0 && (
                <p style={{ color: '#FB7185' }}>{invalidRows.length} invalid</p>
              )}
            </div>

            {/* Show invalid rows with errors */}
            {invalidRows.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {invalidRows.map(row => (
                  <div
                    key={row.rowNumber}
                    className="p-2 rounded text-sm"
                    style={{ backgroundColor: 'rgba(251, 113, 133, 0.1)' }}
                  >
                    <span style={{ color: '#FB7185' }}>Row {row.rowNumber}:</span>{' '}
                    <span style={{ color: '#94A3B8' }}>{row.errors.join(', ')}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Show valid preview (first 5) */}
            {validRows.length > 0 && (
              <div className="mt-3">
                <p className="text-xs mb-2" style={{ color: '#64748B' }}>Preview:</p>
                <div className="space-y-1">
                  {validRows.slice(0, 5).map(row => (
                    <div key={row.rowNumber} className="text-sm" style={{ color: '#F9FAFB' }}>
                      {row.student?.name} (Grade {row.student?.grade})
                    </div>
                  ))}
                  {validRows.length > 5 && (
                    <p className="text-xs" style={{ color: '#64748B' }}>
                      ...and {validRows.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg font-medium"
            style={{ backgroundColor: '#1E293B', color: '#94A3B8' }}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={validRows.length === 0 || isImporting}
            className="flex-1 py-2 rounded-lg font-medium disabled:opacity-50"
            style={{ backgroundColor: '#22C55E', color: '#020617' }}
          >
            {isImporting ? 'Importing...' : `Import ${validRows.length} Students`}
          </button>
        </div>

        {/* Template download link */}
        <p className="text-center text-xs mt-4" style={{ color: '#64748B' }}>
          Need a template?{' '}
          <a
            href="/templates/student-import.csv"
            download
            className="underline"
            style={{ color: '#38BDF8' }}
          >
            Download CSV template
          </a>
        </p>
      </motion.div>
    </div>
  )
}
