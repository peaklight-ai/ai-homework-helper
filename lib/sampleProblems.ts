// Sample math problems covering all primary school math domains
// Organized by domain and grade level

import { MathDomain } from './db'

export interface MathProblem {
  id: string
  question: string
  answer: string
  difficulty: 1 | 2 | 3 | 4 | 5
  topic: string // Internal use only, not shown to students
  domain: MathDomain
  gradeRange: [number, number]
  hints: string[]
}

export const sampleProblems: MathProblem[] = [
  // ============ NUMBER & OPERATIONS ============

  // Addition (Grades 1-2)
  {
    id: 'no-1',
    question: 'Tom has 8 toy cars. His friend gives him 5 more toy cars. How many toy cars does Tom have now?',
    answer: '13',
    difficulty: 1,
    topic: 'addition',
    domain: 'number-operations',
    gradeRange: [1, 2],
    hints: [
      'How many cars did Tom start with?',
      'How many more did he get?',
      'What do we do when we combine amounts?'
    ]
  },
  {
    id: 'no-2',
    question: 'There are 15 birds on a tree. 9 more birds fly in. How many birds are on the tree now?',
    answer: '24',
    difficulty: 1,
    topic: 'addition',
    domain: 'number-operations',
    gradeRange: [1, 2],
    hints: [
      'How many birds were there first?',
      'How many joined them?',
      'Add the two numbers together'
    ]
  },

  // Subtraction (Grades 1-2)
  {
    id: 'no-3',
    question: 'A pizza has 8 slices. If you eat 3 slices, how many slices are left?',
    answer: '5',
    difficulty: 1,
    topic: 'subtraction',
    domain: 'number-operations',
    gradeRange: [1, 2],
    hints: [
      'How many slices were there at the start?',
      'How many were eaten?',
      'What operation do we use when something is taken away?'
    ]
  },
  {
    id: 'no-4',
    question: 'A basket has 15 oranges. If you take out 7 oranges, how many oranges remain in the basket?',
    answer: '8',
    difficulty: 1,
    topic: 'subtraction',
    domain: 'number-operations',
    gradeRange: [1, 2],
    hints: [
      'How many oranges were in the basket initially?',
      'How many were removed?',
      '15 - 7 = ?'
    ]
  },

  // Multiplication (Grades 2-4)
  {
    id: 'no-5',
    question: 'Sarah has 3 bags of apples. Each bag contains 4 apples. How many apples does Sarah have in total?',
    answer: '12',
    difficulty: 2,
    topic: 'multiplication',
    domain: 'number-operations',
    gradeRange: [2, 4],
    hints: [
      'How many apples are in one bag?',
      'If she has 3 bags, what operation would you use?',
      'Try drawing it out - 3 groups of 4 apples'
    ]
  },
  {
    id: 'no-6',
    question: 'A book costs $15. If you buy 2 books, how much do you pay in total?',
    answer: '30',
    difficulty: 2,
    topic: 'multiplication',
    domain: 'number-operations',
    gradeRange: [2, 4],
    hints: [
      "What's the price of one book?",
      'When you buy 2 of something, what operation do you use?',
      'Think: $15 + $15 = ?'
    ]
  },
  {
    id: 'no-7',
    question: 'Emma bought 6 pencils for $2 each. How much did she spend in total?',
    answer: '12',
    difficulty: 2,
    topic: 'multiplication',
    domain: 'number-operations',
    gradeRange: [2, 4],
    hints: [
      'How much does one pencil cost?',
      'How many pencils did she buy?',
      'When buying multiple items at the same price, what operation do we use?'
    ]
  },

  // Division (Grades 3-4)
  {
    id: 'no-8',
    question: 'There are 20 students in a class. The teacher wants to divide them into 4 equal groups. How many students will be in each group?',
    answer: '5',
    difficulty: 2,
    topic: 'division',
    domain: 'number-operations',
    gradeRange: [3, 4],
    hints: [
      'What operation helps us split things into equal groups?',
      'Think about sharing 20 items among 4 groups',
      '20 divided by 4 = ?'
    ]
  },
  {
    id: 'no-9',
    question: 'There are 24 cookies to be shared equally among 6 children. How many cookies does each child get?',
    answer: '4',
    difficulty: 2,
    topic: 'division',
    domain: 'number-operations',
    gradeRange: [3, 4],
    hints: [
      'How many cookies need to be shared?',
      'How many children are sharing?',
      'Division helps us share things equally'
    ]
  },

  // Fractions (Grades 3-5)
  {
    id: 'no-10',
    question: 'A cake is cut into 8 equal pieces. If you eat 2 pieces, what fraction of the cake did you eat?',
    answer: '2/8',
    difficulty: 3,
    topic: 'fractions',
    domain: 'number-operations',
    gradeRange: [3, 5],
    hints: [
      'How many pieces is the whole cake?',
      'How many pieces did you eat?',
      'The fraction is: pieces eaten over total pieces'
    ]
  },

  // ============ ALGEBRAIC THINKING ============

  // Patterns (Grades 1-3)
  {
    id: 'at-1',
    question: 'What comes next in this pattern: 2, 4, 6, 8, ?',
    answer: '10',
    difficulty: 1,
    topic: 'patterns',
    domain: 'algebraic-thinking',
    gradeRange: [1, 3],
    hints: [
      'Look at how the numbers change each time',
      'What do you add to get from 2 to 4?',
      'The pattern adds 2 each time'
    ]
  },
  {
    id: 'at-2',
    question: 'Find the next number: 5, 10, 15, 20, ?',
    answer: '25',
    difficulty: 1,
    topic: 'patterns',
    domain: 'algebraic-thinking',
    gradeRange: [1, 3],
    hints: [
      'Count by fives',
      'What is the difference between each number?',
      'Add 5 to the last number'
    ]
  },

  // Missing Numbers (Grades 2-4)
  {
    id: 'at-3',
    question: 'Fill in the blank: 7 + ? = 12',
    answer: '5',
    difficulty: 2,
    topic: 'equations',
    domain: 'algebraic-thinking',
    gradeRange: [2, 4],
    hints: [
      'What do we need to add to 7 to get 12?',
      'Think: 7 plus something equals 12',
      'You can subtract: 12 - 7 = ?'
    ]
  },
  {
    id: 'at-4',
    question: 'What number makes this true: ? x 3 = 15',
    answer: '5',
    difficulty: 3,
    topic: 'equations',
    domain: 'algebraic-thinking',
    gradeRange: [3, 5],
    hints: [
      'What times 3 gives us 15?',
      'Think about your 3 times table',
      'You can divide: 15 divided by 3 = ?'
    ]
  },

  // ============ GEOMETRY ============

  // Shapes (Grades 1-3)
  {
    id: 'geo-1',
    question: 'A square has 4 sides. How many sides do 3 squares have in total?',
    answer: '12',
    difficulty: 1,
    topic: 'shapes',
    domain: 'geometry',
    gradeRange: [1, 3],
    hints: [
      'How many sides does one square have?',
      'How many squares are there?',
      '4 sides times 3 squares = ?'
    ]
  },
  {
    id: 'geo-2',
    question: 'A triangle has 3 corners (vertices). How many corners do 4 triangles have altogether?',
    answer: '12',
    difficulty: 2,
    topic: 'shapes',
    domain: 'geometry',
    gradeRange: [2, 4],
    hints: [
      'How many corners does one triangle have?',
      'Multiply the corners by the number of triangles',
      '3 corners times 4 triangles = ?'
    ]
  },

  // Perimeter (Grades 3-5)
  {
    id: 'geo-3',
    question: 'A rectangle has a length of 5 cm and a width of 3 cm. What is its perimeter?',
    answer: '16',
    difficulty: 3,
    topic: 'perimeter',
    domain: 'geometry',
    gradeRange: [3, 5],
    hints: [
      'Perimeter is the distance around a shape',
      'A rectangle has 2 lengths and 2 widths',
      'Add: 5 + 3 + 5 + 3 = ?'
    ]
  },

  // Area (Grades 4-6)
  {
    id: 'geo-4',
    question: 'A rectangle is 6 meters long and 4 meters wide. What is its area?',
    answer: '24',
    difficulty: 3,
    topic: 'area',
    domain: 'geometry',
    gradeRange: [4, 6],
    hints: [
      'Area is the space inside a shape',
      'For rectangles: Area = length times width',
      '6 x 4 = ?'
    ]
  },

  // ============ MEASUREMENT ============

  // Time (Grades 1-3)
  {
    id: 'meas-1',
    question: 'A movie starts at 3:00 PM and ends at 5:00 PM. How long is the movie?',
    answer: '2',
    difficulty: 1,
    topic: 'time',
    domain: 'measurement',
    gradeRange: [1, 3],
    hints: [
      'What time did the movie start?',
      'What time did it end?',
      'Count the hours from 3 to 5'
    ]
  },
  {
    id: 'meas-2',
    question: 'School starts at 8:00 AM and ends at 3:00 PM. How many hours are you at school?',
    answer: '7',
    difficulty: 2,
    topic: 'time',
    domain: 'measurement',
    gradeRange: [2, 4],
    hints: [
      'Count the hours from 8 AM to 3 PM',
      'From 8 to 12 is how many hours?',
      'Then add the hours after noon'
    ]
  },

  // Length (Grades 2-4)
  {
    id: 'meas-3',
    question: 'A ribbon is 100 cm long. How many meters is that?',
    answer: '1',
    difficulty: 2,
    topic: 'length',
    domain: 'measurement',
    gradeRange: [2, 4],
    hints: [
      'How many centimeters are in 1 meter?',
      '100 cm = 1 meter',
      'Think about a meter stick'
    ]
  },

  // Weight (Grades 3-5)
  {
    id: 'meas-4',
    question: 'A bag of apples weighs 2 kg. If you buy 3 bags, what is the total weight?',
    answer: '6',
    difficulty: 2,
    topic: 'weight',
    domain: 'measurement',
    gradeRange: [3, 5],
    hints: [
      'How much does one bag weigh?',
      'How many bags are you buying?',
      '2 kg times 3 = ?'
    ]
  },

  // ============ DATA HANDLING ============

  // Reading Charts (Grades 2-4)
  {
    id: 'data-1',
    question: 'In a class survey, 5 students like apples, 8 like oranges, and 3 like bananas. How many students were surveyed in total?',
    answer: '16',
    difficulty: 1,
    topic: 'data-interpretation',
    domain: 'data-handling',
    gradeRange: [2, 4],
    hints: [
      'Add up all the students in each group',
      '5 + 8 + 3 = ?',
      'The total is all students combined'
    ]
  },
  {
    id: 'data-2',
    question: 'A bar graph shows: Monday 4 books, Tuesday 6 books, Wednesday 5 books. How many books total were read in these 3 days?',
    answer: '15',
    difficulty: 2,
    topic: 'graphs',
    domain: 'data-handling',
    gradeRange: [2, 4],
    hints: [
      'Find the value for each day',
      'Add: 4 + 6 + 5',
      'The sum of all bars gives the total'
    ]
  },

  // ============ PROBLEM SOLVING ============

  // Word Problems (Grades 2-4)
  {
    id: 'ps-1',
    question: 'Maria has $20. She buys a toy for $8 and a book for $5. How much money does she have left?',
    answer: '7',
    difficulty: 2,
    topic: 'multi-step',
    domain: 'problem-solving',
    gradeRange: [2, 4],
    hints: [
      'First, find how much Maria spent in total',
      '8 + 5 = 13 dollars spent',
      'Then subtract from what she had: 20 - 13 = ?'
    ]
  },
  {
    id: 'ps-2',
    question: 'A farmer has 15 chickens and 12 ducks. He sells 10 birds. How many birds does he have now?',
    answer: '17',
    difficulty: 2,
    topic: 'multi-step',
    domain: 'problem-solving',
    gradeRange: [2, 4],
    hints: [
      'First, find the total number of birds',
      '15 + 12 = 27 birds',
      'Then subtract the birds sold: 27 - 10 = ?'
    ]
  },

  // Logical Reasoning (Grades 3-5)
  {
    id: 'ps-3',
    question: 'I am thinking of a number. When I double it and add 3, I get 11. What is my number?',
    answer: '4',
    difficulty: 3,
    topic: 'reasoning',
    domain: 'problem-solving',
    gradeRange: [3, 5],
    hints: [
      'Work backwards from 11',
      'If we added 3 to get 11, what did we have before? (11 - 3 = 8)',
      'If 8 is the doubled number, what was the original? (8 divided by 2 = ?)'
    ]
  },
  {
    id: 'ps-4',
    question: 'Three friends share 21 stickers equally. Then each friend gives away 2 stickers. How many stickers does each friend have now?',
    answer: '5',
    difficulty: 3,
    topic: 'multi-step',
    domain: 'problem-solving',
    gradeRange: [3, 5],
    hints: [
      'First, divide 21 stickers among 3 friends',
      '21 divided by 3 = 7 stickers each',
      'Each gives away 2, so 7 - 2 = ?'
    ]
  }
]

export function getRandomProblem(difficulty?: 1 | 2 | 3 | 4 | 5): MathProblem {
  let filtered = sampleProblems

  if (difficulty) {
    // Find problems at or below the requested difficulty
    filtered = sampleProblems.filter(p => p.difficulty <= difficulty)
  }

  if (filtered.length === 0) {
    filtered = sampleProblems
  }

  const randomIndex = Math.floor(Math.random() * filtered.length)
  return filtered[randomIndex]
}

export function getProblemById(id: string): MathProblem | undefined {
  return sampleProblems.find(p => p.id === id)
}

export function getProblemsByDomain(domain: MathDomain): MathProblem[] {
  return sampleProblems.filter(p => p.domain === domain)
}

export function getProblemsByGrade(grade: number): MathProblem[] {
  return sampleProblems.filter(p => grade >= p.gradeRange[0] && grade <= p.gradeRange[1])
}
