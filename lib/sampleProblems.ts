// Sample math problems (GSM8K style)
// For MVP demo - will be replaced with actual GSM8K dataset later

export interface MathProblem {
  id: string
  question: string
  answer: string
  difficulty: number // 1-5
  topic: string
  hints: string[]
}

export const sampleProblems: MathProblem[] = [
  {
    id: '1',
    question: 'Sarah has 3 bags of apples. Each bag contains 4 apples. How many apples does Sarah have in total?',
    answer: '12',
    difficulty: 1,
    topic: 'multiplication',
    hints: [
      'How many apples are in one bag?',
      'If she has 3 bags, what operation would you use?',
      'Try drawing it out - 3 groups of 4 apples'
    ]
  },
  {
    id: '2',
    question: 'A book costs $15. If you buy 2 books, how much do you pay in total?',
    answer: '30',
    difficulty: 1,
    topic: 'multiplication',
    hints: [
      "What's the price of one book?",
      'When you buy 2 of something, what operation do you use?',
      'Think: $15 + $15 = ?'
    ]
  },
  {
    id: '3',
    question: 'There are 20 students in a class. The teacher wants to divide them into 4 equal groups. How many students will be in each group?',
    answer: '5',
    difficulty: 2,
    topic: 'division',
    hints: [
      'What operation helps us split things into equal groups?',
      'Think about sharing 20 items among 4 groups',
      '20 ÷ 4 = ?'
    ]
  },
  {
    id: '4',
    question: 'Tom has 8 toy cars. His friend gives him 5 more toy cars. How many toy cars does Tom have now?',
    answer: '13',
    difficulty: 1,
    topic: 'addition',
    hints: [
      'How many cars did Tom start with?',
      'How many more did he get?',
      'What do we do when we combine amounts?'
    ]
  },
  {
    id: '5',
    question: 'A pizza has 8 slices. If you eat 3 slices, how many slices are left?',
    answer: '5',
    difficulty: 1,
    topic: 'subtraction',
    hints: [
      'How many slices were there at the start?',
      'How many were eaten?',
      'What operation do we use when something is taken away?'
    ]
  },
  {
    id: '6',
    question: 'Emma bought 6 pencils for $2 each. How much did she spend in total?',
    answer: '12',
    difficulty: 2,
    topic: 'multiplication',
    hints: [
      'How much does one pencil cost?',
      'How many pencils did she buy?',
      'When buying multiple items at the same price, what operation do we use?'
    ]
  },
  {
    id: '7',
    question: 'A basket has 15 oranges. If you take out 7 oranges, how many oranges remain in the basket?',
    answer: '8',
    difficulty: 1,
    topic: 'subtraction',
    hints: [
      'How many oranges were in the basket initially?',
      'How many were removed?',
      '15 - 7 = ?'
    ]
  },
  {
    id: '8',
    question: 'There are 24 cookies to be shared equally among 6 children. How many cookies does each child get?',
    answer: '4',
    difficulty: 2,
    topic: 'division',
    hints: [
      'How many cookies need to be shared?',
      'How many children are sharing?',
      'Division helps us share things equally'
    ]
  }
]

export function getRandomProblem(difficulty?: number): MathProblem {
  const filtered = difficulty
    ? sampleProblems.filter(p => p.difficulty === difficulty)
    : sampleProblems

  const randomIndex = Math.floor(Math.random() * filtered.length)
  return filtered[randomIndex]
}

export function getProblemById(id: string): MathProblem | undefined {
  return sampleProblems.find(p => p.id === id)
}
