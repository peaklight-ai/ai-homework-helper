'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { extractTextFromImage, parseMathProblem, fileToDataURL, OCRProgress } from '@/lib/ocr'

// =============================================================================
// HOMEWORK UPLOAD COMPONENT
// =============================================================================
// Kid-friendly UI for taking/uploading homework photos
// Uses Tesseract.js for OCR extraction
// =============================================================================

interface HomeworkUploadProps {
  onProblemExtracted: (question: string, expectedAnswer?: number) => void
  onCancel: () => void
}

type UploadStep = 'select' | 'preview' | 'processing' | 'review' | 'error'

export function HomeworkUpload({ onProblemExtracted, onCancel }: HomeworkUploadProps) {
  const [step, setStep] = useState<UploadStep>('select')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState<OCRProgress | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [editedText, setEditedText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        setStep('error')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image is too large. Please use a smaller image (max 10MB)')
        setStep('error')
        return
      }

      // Convert to data URL for preview
      const dataUrl = await fileToDataURL(file)
      setImageUrl(dataUrl)
      setStep('preview')
    } catch (err) {
      console.error('Error processing file:', err)
      setError('Could not read the image. Please try again.')
      setStep('error')
    }
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const processImage = useCallback(async () => {
    if (!imageUrl) return

    setStep('processing')
    setProgress({ status: 'Starting...', progress: 0 })

    try {
      const result = await extractTextFromImage(imageUrl, setProgress)

      if (!result.text || result.text.trim().length === 0) {
        setError('Could not find any text in the image. Try a clearer photo.')
        setStep('error')
        return
      }

      setExtractedText(result.text)
      setEditedText(result.text)
      setStep('review')
    } catch (err) {
      console.error('OCR error:', err)
      setError('Could not read the text. Please try a clearer photo.')
      setStep('error')
    }
  }, [imageUrl])

  const handleSubmit = useCallback(() => {
    const parsed = parseMathProblem(editedText)
    if (parsed) {
      onProblemExtracted(parsed.question, parsed.expectedAnswer)
    } else {
      // Just use the text as a question
      onProblemExtracted(editedText)
    }
  }, [editedText, onProblemExtracted])

  const resetUpload = useCallback(() => {
    setStep('select')
    setImageUrl(null)
    setProgress(null)
    setExtractedText('')
    setEditedText('')
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-6 w-full max-w-md"
      >
        <AnimatePresence mode="wait">
          {/* Step 1: Select Image Source */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">📸</div>
                <h2 className="text-2xl font-bold text-gray-800">Upload Homework</h2>
                <p className="text-gray-600 mt-2">Take a photo or upload your math problem!</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Camera Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => cameraInputRef.current?.click()}
                  className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-2xl p-6 flex flex-col items-center gap-2 shadow-lg"
                >
                  <span className="text-4xl">📷</span>
                  <span className="font-semibold">Take Photo</span>
                </motion.button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleInputChange}
                  className="hidden"
                />

                {/* Upload Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-2xl p-6 flex flex-col items-center gap-2 shadow-lg"
                >
                  <span className="text-4xl">📁</span>
                  <span className="font-semibold">Upload</span>
                </motion.button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>

              <button
                onClick={onCancel}
                className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Go Back
              </button>
            </motion.div>
          )}

          {/* Step 2: Preview Image */}
          {step === 'preview' && imageUrl && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-800">Looking Good?</h2>
                <p className="text-gray-600 text-sm">Make sure the problem is clear and readable</p>
              </div>

              <div className="rounded-xl overflow-hidden border-4 border-gray-200 shadow-inner">
                <img
                  src={imageUrl}
                  alt="Homework preview"
                  className="w-full h-auto max-h-64 object-contain bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetUpload}
                  className="py-3 px-4 border-2 border-gray-300 rounded-xl text-gray-600 font-semibold"
                >
                  ↻ Retake
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={processImage}
                  className="py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg"
                >
                  Read Text ✨
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Processing */}
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 text-center"
            >
              <div className="text-6xl animate-bounce">🔍</div>
              <h2 className="text-xl font-bold text-gray-800">Reading Your Homework...</h2>

              {progress && (
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.progress}%` }}
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                    />
                  </div>
                  <p className="text-sm text-gray-600">{progress.status} ({progress.progress}%)</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4: Review Extracted Text */}
          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center">
                <div className="text-4xl mb-2">✅</div>
                <h2 className="text-xl font-bold text-gray-800">Here&apos;s What I Found!</h2>
                <p className="text-gray-600 text-sm">You can fix any mistakes below</p>
              </div>

              <div className="relative">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl text-lg font-mono resize-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none"
                  placeholder="The extracted text will appear here..."
                />
                {editedText !== extractedText && (
                  <button
                    onClick={() => setEditedText(extractedText)}
                    className="absolute top-2 right-2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetUpload}
                  className="py-3 px-4 border-2 border-gray-300 rounded-xl text-gray-600 font-semibold"
                >
                  Try Again
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={!editedText.trim()}
                  className="py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50"
                >
                  Solve It! 🚀
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 text-center"
            >
              <div className="text-6xl">😅</div>
              <h2 className="text-xl font-bold text-gray-800">Oops!</h2>
              <p className="text-gray-600">{error}</p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetUpload}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg"
              >
                Try Again
              </motion.button>

              <button
                onClick={onCancel}
                className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Go Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
