import Tesseract from 'tesseract.js'

// =============================================================================
// OCR LIBRARY - Tesseract.js Integration
// =============================================================================
// Extracts text from homework photos using OCR
// Optimized for math problems and handwritten text
// =============================================================================

export interface OCRResult {
  text: string
  confidence: number
  words: Array<{
    text: string
    confidence: number
    bbox: { x0: number; y0: number; x1: number; y1: number }
  }>
}

export interface OCRProgress {
  status: string
  progress: number
}

/**
 * Extract text from an image using Tesseract.js
 */
export async function extractTextFromImage(
  imageSource: string | File | Blob,
  onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult> {
  try {
    const result = await Tesseract.recognize(
      imageSource,
      'eng', // English language
      {
        logger: (m) => {
          if (onProgress && m.status && typeof m.progress === 'number') {
            onProgress({
              status: m.status,
              progress: Math.round(m.progress * 100)
            })
          }
        }
      }
    )

    // Extract words with bounding boxes
    const words = result.data.words.map(word => ({
      text: word.text,
      confidence: word.confidence,
      bbox: word.bbox
    }))

    return {
      text: result.data.text.trim(),
      confidence: result.data.confidence,
      words
    }
  } catch (error) {
    console.error('OCR error:', error)
    throw new Error('Failed to extract text from image')
  }
}

/**
 * Clean up extracted text for math problems
 * Handles common OCR mistakes in math expressions
 */
export function cleanMathText(text: string): string {
  return text
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
    // Fix common OCR mistakes for math
    .replace(/[oO]/g, '0') // O often misread as zero in numbers
    .replace(/[lI]/g, '1') // l/I often misread as 1
    .replace(/[×x]/gi, '*') // multiplication signs
    .replace(/[÷]/g, '/') // division signs
    .replace(/[—–-]/g, '-') // various dashes
    .replace(/\s*=\s*/g, ' = ') // normalize equals
    .replace(/\s*\+\s*/g, ' + ') // normalize plus
    .replace(/\s*-\s*/g, ' - ') // normalize minus
    .replace(/\s*\*\s*/g, ' × ') // normalize multiply (use ×)
    .replace(/\s*\/\s*/g, ' ÷ ') // normalize divide (use ÷)
}

/**
 * Attempt to parse a math problem from OCR text
 * Returns the question and expected answer if detectable
 */
export function parseMathProblem(text: string): {
  question: string
  expectedAnswer?: number
} | null {
  const cleanedText = cleanMathText(text)

  // Try to find a math expression pattern
  // Patterns: "5 + 3 = ?", "What is 5 + 3?", "5 + 3", etc.
  const patterns = [
    // "5 + 3 = ?" or "5 + 3 = _"
    /(\d+\s*[+\-×÷]\s*\d+)\s*=\s*[\?_]/i,
    // "What is 5 + 3?"
    /what\s+is\s+(\d+\s*[+\-×÷]\s*\d+)/i,
    // "Calculate 5 + 3"
    /calculate\s+(\d+\s*[+\-×÷]\s*\d+)/i,
    // "5 + 3 ="
    /(\d+\s*[+\-×÷]\s*\d+)\s*=/i,
    // Just "5 + 3"
    /(\d+\s*[+\-×÷]\s*\d+)/i
  ]

  for (const pattern of patterns) {
    const match = cleanedText.match(pattern)
    if (match) {
      const expression = match[1].trim()
      const answer = evaluateExpression(expression)

      return {
        question: `What is ${expression}?`,
        expectedAnswer: answer
      }
    }
  }

  // If no math pattern found, return the cleaned text as a question
  if (cleanedText.length > 0) {
    return {
      question: cleanedText
    }
  }

  return null
}

/**
 * Evaluate a simple math expression
 */
function evaluateExpression(expression: string): number | undefined {
  try {
    // Convert display operators back to JS operators
    const jsExpression = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\s+/g, '')

    // Only evaluate if it's a safe expression (numbers and operators only)
    if (/^[\d+\-*/().]+$/.test(jsExpression)) {
      // Using Function constructor for safe eval of math expression
      return Function(`"use strict"; return (${jsExpression})`)()
    }
  } catch {
    return undefined
  }
  return undefined
}

/**
 * Convert a File/Blob to base64 data URL
 */
export function fileToDataURL(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
