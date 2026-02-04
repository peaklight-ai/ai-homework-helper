// =============================================================================
// DIAGNOSTIC QUESTIONS BY GRADE
// =============================================================================
// Each grade has questions across domains at varying difficulty levels.
// Diagnostic starts at medium (3) and adapts based on responses.
//
// LEVEL DETERMINATION ALGORITHM (CONTENT-06):
// -------------------------------------------
// The student's level is calculated by `calculateRecommendedLevel()`:
// 1. Group all responses by difficulty level (1-5)
// 2. For each difficulty level, calculate accuracy (correct/total)
// 3. Find the HIGHEST difficulty where accuracy >= 60%
// 4. That becomes the student's recommended level for that domain
//
// Example: Student answers at difficulties 1,2,3,4,5
//   - Level 1: 2/2 correct (100%) ✓
//   - Level 2: 3/3 correct (100%) ✓
//   - Level 3: 4/5 correct (80%) ✓
//   - Level 4: 2/4 correct (50%) ✗
//   - Level 5: 0/1 correct (0%) ✗
//   → Recommended level: 3 (highest with ≥60% accuracy)
//
// ADAPTIVE QUESTIONING:
// ---------------------
// During diagnostic, the system uses `getAdaptiveQuestion()`:
// - If student answers correctly → increase difficulty by 1 (max 5)
// - If student answers incorrectly → decrease difficulty by 1 (min 1)
// This creates a "staircase" pattern that quickly finds the student's level.
//
// GRADE-LEVEL FILTERING (CONTENT-05):
// -----------------------------------
// Questions are tagged with grade level (1-6). The diagnostic:
// 1. Starts with questions for the student's enrolled grade
// 2. Uses `getQuestionsByGrade()` to filter appropriate questions
// 3. Never shows questions above the student's grade level
// =============================================================================

export interface DiagnosticQuestionData {
  grade: 1 | 2 | 3 | 4 | 5 | 6
  domain: string
  difficulty: 1 | 2 | 3 | 4 | 5
  question: string
  answer: string
  hints: string[]
  // Word problems have a "type" field for categorization
  type?: 'computation' | 'word-problem'
}

export const diagnosticQuestions: DiagnosticQuestionData[] = [
  // ==========================================================================
  // GRADE 1 (Ages 6-7) - Concrete story problems, solve together
  // Focus: Single-digit operations, concrete scenarios
  // ==========================================================================

  // Addition - Computation
  { grade: 1, domain: 'addition', difficulty: 1, question: 'What is 2 + 1?', answer: '3', hints: ['Count on your fingers: 2... then 1 more'], type: 'computation' },
  { grade: 1, domain: 'addition', difficulty: 2, question: 'What is 4 + 3?', answer: '7', hints: ['Start at 4 and count up 3 more'], type: 'computation' },
  { grade: 1, domain: 'addition', difficulty: 3, question: 'What is 6 + 5?', answer: '11', hints: ['6 + 4 = 10, then add 1 more'], type: 'computation' },
  { grade: 1, domain: 'addition', difficulty: 4, question: 'What is 8 + 7?', answer: '15', hints: ['8 + 2 = 10, then add 5 more'], type: 'computation' },
  { grade: 1, domain: 'addition', difficulty: 5, question: 'What is 9 + 8?', answer: '17', hints: ['9 + 1 = 10, then add 7 more'], type: 'computation' },

  // Addition - Word Problems (CONTENT-04)
  { grade: 1, domain: 'addition', difficulty: 1, question: 'Sam has 2 apples. He gets 1 more. How many apples does Sam have now?', answer: '3', hints: ['Start with 2, add 1 more'], type: 'word-problem' },
  { grade: 1, domain: 'addition', difficulty: 2, question: 'There are 3 birds on a tree. 4 more birds fly over. How many birds are there now?', answer: '7', hints: ['3 birds + 4 birds = ?'], type: 'word-problem' },
  { grade: 1, domain: 'addition', difficulty: 3, question: 'Emma has 5 stickers. Her friend gives her 6 more. How many stickers does Emma have?', answer: '11', hints: ['5 + 6 = ? Try counting up from 5'], type: 'word-problem' },
  { grade: 1, domain: 'addition', difficulty: 4, question: 'A basket has 7 oranges. Mom puts in 8 more oranges. How many oranges are in the basket?', answer: '15', hints: ['7 + 8 = ? Make 10 first: 7 + 3 = 10, then add 5'], type: 'word-problem' },
  { grade: 1, domain: 'addition', difficulty: 5, question: 'Jake read 9 pages yesterday and 9 pages today. How many pages did Jake read in total?', answer: '18', hints: ['9 + 9 = ? Double 9!'], type: 'word-problem' },

  // Subtraction - Computation
  { grade: 1, domain: 'subtraction', difficulty: 1, question: 'What is 3 - 1?', answer: '2', hints: ['If you have 3 apples and eat 1...'], type: 'computation' },
  { grade: 1, domain: 'subtraction', difficulty: 2, question: 'What is 7 - 3?', answer: '4', hints: ['Count back from 7: 6, 5, 4'], type: 'computation' },
  { grade: 1, domain: 'subtraction', difficulty: 3, question: 'What is 10 - 4?', answer: '6', hints: ['What plus 4 equals 10?'], type: 'computation' },
  { grade: 1, domain: 'subtraction', difficulty: 4, question: 'What is 12 - 5?', answer: '7', hints: ['12 - 2 = 10, then take away 3 more'], type: 'computation' },
  { grade: 1, domain: 'subtraction', difficulty: 5, question: 'What is 15 - 8?', answer: '7', hints: ['15 - 5 = 10, then take away 3 more'], type: 'computation' },

  // Subtraction - Word Problems (CONTENT-04)
  { grade: 1, domain: 'subtraction', difficulty: 1, question: 'Lily has 4 cookies. She eats 1. How many cookies are left?', answer: '3', hints: ['Start with 4, take away 1'], type: 'word-problem' },
  { grade: 1, domain: 'subtraction', difficulty: 2, question: 'There are 8 ducks in a pond. 3 ducks swim away. How many ducks are left?', answer: '5', hints: ['8 - 3 = ? Count back from 8'], type: 'word-problem' },
  { grade: 1, domain: 'subtraction', difficulty: 3, question: 'Ben has 10 toy cars. He gives 4 to his brother. How many cars does Ben have now?', answer: '6', hints: ['10 - 4 = ?'], type: 'word-problem' },
  { grade: 1, domain: 'subtraction', difficulty: 4, question: 'A box has 13 crayons. Mia takes 6 crayons. How many crayons are in the box?', answer: '7', hints: ['13 - 6 = ? Break it down: 13 - 3 = 10, then 10 - 3 = 7'], type: 'word-problem' },
  { grade: 1, domain: 'subtraction', difficulty: 5, question: 'Anna had 16 balloons. 9 balloons popped. How many balloons does Anna have now?', answer: '7', hints: ['16 - 9 = ? Think: 16 - 6 = 10, then 10 - 3 = 7'], type: 'word-problem' },

  // ==========================================================================
  // GRADE 2 (Ages 7-8) - One-step problems, teach steps and language
  // Focus: Two-digit numbers, introduction to multiplication
  // ==========================================================================

  // Addition - Computation
  { grade: 2, domain: 'addition', difficulty: 1, question: 'What is 12 + 5?', answer: '17', hints: ['Add the ones first'], type: 'computation' },
  { grade: 2, domain: 'addition', difficulty: 2, question: 'What is 23 + 14?', answer: '37', hints: ['20 + 10 = 30, then 3 + 4 = 7'], type: 'computation' },
  { grade: 2, domain: 'addition', difficulty: 3, question: 'What is 38 + 25?', answer: '63', hints: ['30 + 20 = 50, 8 + 5 = 13, so 50 + 13 = ?'], type: 'computation' },
  { grade: 2, domain: 'addition', difficulty: 4, question: 'What is 47 + 36?', answer: '83', hints: ['40 + 30 = 70, 7 + 6 = 13'], type: 'computation' },
  { grade: 2, domain: 'addition', difficulty: 5, question: 'What is 58 + 67?', answer: '125', hints: ['50 + 60 = 110, 8 + 7 = 15'], type: 'computation' },

  // Addition - Word Problems (CONTENT-04)
  { grade: 2, domain: 'addition', difficulty: 1, question: 'A class has 15 boys and 8 girls. How many students are in the class?', answer: '23', hints: ['15 + 8 = ? Add the ones first'], type: 'word-problem' },
  { grade: 2, domain: 'addition', difficulty: 2, question: 'Tom collected 24 seashells on Monday and 19 on Tuesday. How many seashells did he collect?', answer: '43', hints: ['24 + 19 = ? Think: 24 + 20 = 44, minus 1'], type: 'word-problem' },
  { grade: 2, domain: 'addition', difficulty: 3, question: 'A bookshelf has 36 books. Another shelf has 28 books. How many books are there in total?', answer: '64', hints: ['36 + 28 = ? 36 + 30 = 66, minus 2'], type: 'word-problem' },
  { grade: 2, domain: 'addition', difficulty: 4, question: 'In the morning, 45 people visited the zoo. In the afternoon, 38 more people came. How many people visited the zoo?', answer: '83', hints: ['45 + 38 = ? Add tens first: 40 + 30 = 70'], type: 'word-problem' },
  { grade: 2, domain: 'addition', difficulty: 5, question: 'Maria saved $56. Her grandma gave her $48. How much money does Maria have now?', answer: '104', hints: ['56 + 48 = ? 56 + 50 = 106, minus 2'], type: 'word-problem' },

  // Subtraction - Computation
  { grade: 2, domain: 'subtraction', difficulty: 1, question: 'What is 18 - 5?', answer: '13', hints: ['Subtract the ones'], type: 'computation' },
  { grade: 2, domain: 'subtraction', difficulty: 2, question: 'What is 34 - 12?', answer: '22', hints: ['30 - 10 = 20, 4 - 2 = 2'], type: 'computation' },
  { grade: 2, domain: 'subtraction', difficulty: 3, question: 'What is 52 - 28?', answer: '24', hints: ['52 - 30 = 22, then add back 2'], type: 'computation' },
  { grade: 2, domain: 'subtraction', difficulty: 4, question: 'What is 73 - 45?', answer: '28', hints: ['73 - 40 = 33, then subtract 5'], type: 'computation' },
  { grade: 2, domain: 'subtraction', difficulty: 5, question: 'What is 91 - 56?', answer: '35', hints: ['91 - 50 = 41, then subtract 6'], type: 'computation' },

  // Subtraction - Word Problems (CONTENT-04)
  { grade: 2, domain: 'subtraction', difficulty: 1, question: 'A jar has 20 marbles. Tim takes 7 marbles. How many marbles are left?', answer: '13', hints: ['20 - 7 = ?'], type: 'word-problem' },
  { grade: 2, domain: 'subtraction', difficulty: 2, question: 'Emily had 35 stickers. She gave 14 to her friend. How many stickers does Emily have?', answer: '21', hints: ['35 - 14 = ? Subtract tens, then ones'], type: 'word-problem' },
  { grade: 2, domain: 'subtraction', difficulty: 3, question: 'A library had 62 books. 28 books were borrowed. How many books are still in the library?', answer: '34', hints: ['62 - 28 = ? Try: 62 - 30 = 32, then add 2'], type: 'word-problem' },
  { grade: 2, domain: 'subtraction', difficulty: 4, question: 'Carlos had 80 baseball cards. He lost 37 cards. How many cards does Carlos have now?', answer: '43', hints: ['80 - 37 = ? 80 - 40 = 40, then add 3'], type: 'word-problem' },
  { grade: 2, domain: 'subtraction', difficulty: 5, question: 'A store had 95 toys. They sold 58 toys. How many toys are left?', answer: '37', hints: ['95 - 58 = ? 95 - 60 = 35, then add 2'], type: 'word-problem' },

  // Multiplication (intro) - Computation
  { grade: 2, domain: 'multiplication', difficulty: 1, question: 'What is 2 × 3?', answer: '6', hints: ['2 groups of 3: 3 + 3 = ?'], type: 'computation' },
  { grade: 2, domain: 'multiplication', difficulty: 2, question: 'What is 3 × 4?', answer: '12', hints: ['3 groups of 4: 4 + 4 + 4'], type: 'computation' },
  { grade: 2, domain: 'multiplication', difficulty: 3, question: 'What is 5 × 5?', answer: '25', hints: ['Skip count by 5s: 5, 10, 15, 20, ?'], type: 'computation' },
  { grade: 2, domain: 'multiplication', difficulty: 4, question: 'What is 4 × 6?', answer: '24', hints: ['4 groups of 6, or skip count by 4s to 6'], type: 'computation' },
  { grade: 2, domain: 'multiplication', difficulty: 5, question: 'What is 6 × 7?', answer: '42', hints: ['6 × 7: Think 6 × 5 = 30, plus 6 × 2 = 12'], type: 'computation' },

  // Multiplication - Word Problems (CONTENT-04)
  { grade: 2, domain: 'multiplication', difficulty: 1, question: 'There are 2 baskets. Each basket has 3 apples. How many apples are there?', answer: '6', hints: ['2 groups of 3 = 2 × 3'], type: 'word-problem' },
  { grade: 2, domain: 'multiplication', difficulty: 2, question: 'A spider has 8 legs. How many legs do 2 spiders have?', answer: '16', hints: ['2 × 8 = ? Count by 8s'], type: 'word-problem' },
  { grade: 2, domain: 'multiplication', difficulty: 3, question: 'There are 5 flowers in each pot. There are 4 pots. How many flowers are there?', answer: '20', hints: ['4 × 5 = ? Skip count by 5s four times'], type: 'word-problem' },

  // Division (intro) - Computation (CONTENT-03)
  { grade: 2, domain: 'division', difficulty: 1, question: 'What is 6 ÷ 2?', answer: '3', hints: ['How many groups of 2 in 6?'], type: 'computation' },
  { grade: 2, domain: 'division', difficulty: 2, question: 'What is 10 ÷ 5?', answer: '2', hints: ['If you share 10 things equally among 5, each gets...'], type: 'computation' },
  { grade: 2, domain: 'division', difficulty: 3, question: 'What is 12 ÷ 4?', answer: '3', hints: ['4 × ? = 12'], type: 'computation' },
  { grade: 2, domain: 'division', difficulty: 4, question: 'What is 20 ÷ 4?', answer: '5', hints: ['How many 4s make 20?'], type: 'computation' },
  { grade: 2, domain: 'division', difficulty: 5, question: 'What is 18 ÷ 3?', answer: '6', hints: ['3 × ? = 18'], type: 'computation' },

  // Division - Word Problems (CONTENT-04)
  { grade: 2, domain: 'division', difficulty: 1, question: 'Mom has 8 cookies to share equally between 2 children. How many cookies does each child get?', answer: '4', hints: ['8 ÷ 2 = ? Split 8 into 2 equal groups'], type: 'word-problem' },
  { grade: 2, domain: 'division', difficulty: 2, question: 'There are 15 apples to put into 3 baskets equally. How many apples go in each basket?', answer: '5', hints: ['15 ÷ 3 = ?'], type: 'word-problem' },
  { grade: 2, domain: 'division', difficulty: 3, question: '24 students need to form groups of 4. How many groups will there be?', answer: '6', hints: ['24 ÷ 4 = ? How many 4s in 24?'], type: 'word-problem' },

  // ==========================================================================
  // GRADE 3 (Ages 8-9) - Multi-step strategies, model and scaffold
  // Focus: Multiplication facts, division, larger numbers
  // ==========================================================================

  // Addition/Subtraction - Computation
  { grade: 3, domain: 'addition', difficulty: 1, question: 'What is 145 + 32?', answer: '177', hints: ['Add hundreds, tens, ones separately'], type: 'computation' },
  { grade: 3, domain: 'addition', difficulty: 2, question: 'What is 189 + 56?', answer: '245', hints: ['180 + 50 = 230, 9 + 6 = 15'], type: 'computation' },
  { grade: 3, domain: 'addition', difficulty: 3, question: 'What is 234 + 178?', answer: '412', hints: ['Add hundreds, tens, ones separately'], type: 'computation' },
  { grade: 3, domain: 'addition', difficulty: 4, question: 'What is 567 + 289?', answer: '856', hints: ['500 + 200 = 700, 67 + 89 = 156'], type: 'computation' },
  { grade: 3, domain: 'addition', difficulty: 5, question: 'What is 748 + 396?', answer: '1144', hints: ['700 + 300 = 1000, 48 + 96 = 144'], type: 'computation' },

  // Addition - Word Problems (CONTENT-04)
  { grade: 3, domain: 'addition', difficulty: 2, question: 'A school has 156 boys and 148 girls. How many students are in the school?', answer: '304', hints: ['156 + 148 = ? Add hundreds, then tens, then ones'], type: 'word-problem' },
  { grade: 3, domain: 'addition', difficulty: 3, question: 'Dad drove 234 miles on Monday and 189 miles on Tuesday. How many miles did Dad drive in total?', answer: '423', hints: ['234 + 189 = ?'], type: 'word-problem' },
  { grade: 3, domain: 'addition', difficulty: 4, question: 'A movie theater sold 478 tickets on Saturday and 395 tickets on Sunday. How many tickets were sold?', answer: '873', hints: ['478 + 395 = ? Round 395 to 400, then adjust'], type: 'word-problem' },

  // Subtraction - Computation
  { grade: 3, domain: 'subtraction', difficulty: 1, question: 'What is 175 - 42?', answer: '133', hints: ['Subtract ones, then tens, then hundreds'], type: 'computation' },
  { grade: 3, domain: 'subtraction', difficulty: 2, question: 'What is 300 - 127?', answer: '173', hints: ['300 - 130 = 170, then add 3'], type: 'computation' },
  { grade: 3, domain: 'subtraction', difficulty: 3, question: 'What is 503 - 247?', answer: '256', hints: ['You may need to borrow'], type: 'computation' },
  { grade: 3, domain: 'subtraction', difficulty: 4, question: 'What is 612 - 375?', answer: '237', hints: ['Borrow from tens and hundreds as needed'], type: 'computation' },
  { grade: 3, domain: 'subtraction', difficulty: 5, question: 'What is 1000 - 456?', answer: '544', hints: ['1000 - 500 = 500, then adjust'], type: 'computation' },

  // Subtraction - Word Problems (CONTENT-04)
  { grade: 3, domain: 'subtraction', difficulty: 2, question: 'A library had 500 books. 183 books were checked out. How many books are left?', answer: '317', hints: ['500 - 183 = ?'], type: 'word-problem' },
  { grade: 3, domain: 'subtraction', difficulty: 3, question: 'Emma saved $425. She spent $178 on a gift. How much money does Emma have left?', answer: '247', hints: ['425 - 178 = ? You will need to borrow'], type: 'word-problem' },
  { grade: 3, domain: 'subtraction', difficulty: 4, question: 'A farm had 1,000 chickens. 367 chickens were sold. How many chickens are on the farm now?', answer: '633', hints: ['1000 - 367 = ?'], type: 'word-problem' },

  // Multiplication - Computation
  { grade: 3, domain: 'multiplication', difficulty: 1, question: 'What is 4 × 6?', answer: '24', hints: ['4 × 5 = 20, then add one more 4'], type: 'computation' },
  { grade: 3, domain: 'multiplication', difficulty: 2, question: 'What is 7 × 8?', answer: '56', hints: ['7 × 8 = 56 (5, 6, 7, 8)'], type: 'computation' },
  { grade: 3, domain: 'multiplication', difficulty: 3, question: 'What is 9 × 7?', answer: '63', hints: ['10 × 7 = 70, minus 7'], type: 'computation' },
  { grade: 3, domain: 'multiplication', difficulty: 4, question: 'What is 12 × 6?', answer: '72', hints: ['10 × 6 = 60, 2 × 6 = 12'], type: 'computation' },
  { grade: 3, domain: 'multiplication', difficulty: 5, question: 'What is 15 × 8?', answer: '120', hints: ['15 × 8 = (10 × 8) + (5 × 8)'], type: 'computation' },

  // Multiplication - Word Problems (CONTENT-04)
  { grade: 3, domain: 'multiplication', difficulty: 2, question: 'Each box has 6 donuts. There are 7 boxes. How many donuts are there in total?', answer: '42', hints: ['7 × 6 = ?'], type: 'word-problem' },
  { grade: 3, domain: 'multiplication', difficulty: 3, question: 'A parking lot has 8 rows. Each row has 9 cars. How many cars are in the parking lot?', answer: '72', hints: ['8 × 9 = ? Think: 8 × 10 = 80, minus 8'], type: 'word-problem' },
  { grade: 3, domain: 'multiplication', difficulty: 4, question: 'There are 12 months in a year. How many months are in 5 years?', answer: '60', hints: ['5 × 12 = ? 5 × 10 = 50, 5 × 2 = 10'], type: 'word-problem' },
  { grade: 3, domain: 'multiplication', difficulty: 5, question: 'A theater has 15 rows with 12 seats in each row. How many seats are in the theater?', answer: '180', hints: ['15 × 12 = ? Break it down: 15 × 10 + 15 × 2'], type: 'word-problem' },

  // Division - Computation
  { grade: 3, domain: 'division', difficulty: 1, question: 'What is 12 ÷ 3?', answer: '4', hints: ['How many 3s in 12?'], type: 'computation' },
  { grade: 3, domain: 'division', difficulty: 2, question: 'What is 24 ÷ 4?', answer: '6', hints: ['4 × ? = 24'], type: 'computation' },
  { grade: 3, domain: 'division', difficulty: 3, question: 'What is 42 ÷ 7?', answer: '6', hints: ['7 × 6 = ?'], type: 'computation' },
  { grade: 3, domain: 'division', difficulty: 4, question: 'What is 56 ÷ 8?', answer: '7', hints: ['8 × 7 = 56'], type: 'computation' },
  { grade: 3, domain: 'division', difficulty: 5, question: 'What is 81 ÷ 9?', answer: '9', hints: ['9 × 9 = ?'], type: 'computation' },

  // Division - Word Problems (CONTENT-04)
  { grade: 3, domain: 'division', difficulty: 2, question: 'There are 28 students. They need to form teams of 4. How many teams can they make?', answer: '7', hints: ['28 ÷ 4 = ?'], type: 'word-problem' },
  { grade: 3, domain: 'division', difficulty: 3, question: 'A baker made 54 muffins. She puts 6 muffins in each box. How many boxes does she need?', answer: '9', hints: ['54 ÷ 6 = ?'], type: 'word-problem' },
  { grade: 3, domain: 'division', difficulty: 4, question: 'Dad bought 72 baseball cards. He wants to divide them equally among 8 friends. How many cards does each friend get?', answer: '9', hints: ['72 ÷ 8 = ?'], type: 'word-problem' },
  { grade: 3, domain: 'division', difficulty: 5, question: 'A ribbon is 90 inches long. It needs to be cut into pieces that are 9 inches each. How many pieces can be made?', answer: '10', hints: ['90 ÷ 9 = ?'], type: 'word-problem' },

  // ==========================================================================
  // GRADE 4 (Ages 9-10) - Independent reasoning, coach and extend
  // Focus: Multi-digit operations, larger problems
  // ==========================================================================

  // Addition - Computation
  { grade: 4, domain: 'addition', difficulty: 1, question: 'What is 456 + 123?', answer: '579', hints: ['Add each place value'], type: 'computation' },
  { grade: 4, domain: 'addition', difficulty: 2, question: 'What is 789 + 456?', answer: '1245', hints: ['Add ones, tens, hundreds, carrying when needed'], type: 'computation' },
  { grade: 4, domain: 'addition', difficulty: 3, question: 'What is 1,234 + 2,567?', answer: '3801', hints: ['Add from right to left, carrying when needed'], type: 'computation' },
  { grade: 4, domain: 'addition', difficulty: 4, question: 'What is 3,456 + 2,789?', answer: '6245', hints: ['Watch for carries in each place'], type: 'computation' },
  { grade: 4, domain: 'addition', difficulty: 5, question: 'What is 9,876 + 5,432?', answer: '15308', hints: ['Add systematically from right to left'], type: 'computation' },

  // Addition - Word Problems (CONTENT-04)
  { grade: 4, domain: 'addition', difficulty: 2, question: 'A school collected 1,245 cans in week 1 and 987 cans in week 2. How many cans were collected in total?', answer: '2232', hints: ['1245 + 987 = ?'], type: 'word-problem' },
  { grade: 4, domain: 'addition', difficulty: 3, question: 'Town A has 4,567 people. Town B has 3,845 people. What is the total population?', answer: '8412', hints: ['4567 + 3845 = ?'], type: 'word-problem' },
  { grade: 4, domain: 'addition', difficulty: 4, question: 'A company sold 12,456 items in January and 9,877 items in February. How many items were sold in total?', answer: '22333', hints: ['12456 + 9877 = ?'], type: 'word-problem' },

  // Subtraction - Computation
  { grade: 4, domain: 'subtraction', difficulty: 1, question: 'What is 567 - 234?', answer: '333', hints: ['Subtract each place value'], type: 'computation' },
  { grade: 4, domain: 'subtraction', difficulty: 2, question: 'What is 1,000 - 456?', answer: '544', hints: ['Borrow from the thousands place'], type: 'computation' },
  { grade: 4, domain: 'subtraction', difficulty: 3, question: 'What is 5,000 - 1,234?', answer: '3766', hints: ['Borrow from each place'], type: 'computation' },
  { grade: 4, domain: 'subtraction', difficulty: 4, question: 'What is 8,503 - 2,768?', answer: '5735', hints: ['Borrow carefully from each place'], type: 'computation' },
  { grade: 4, domain: 'subtraction', difficulty: 5, question: 'What is 10,000 - 3,456?', answer: '6544', hints: ['Borrow through all the zeros'], type: 'computation' },

  // Subtraction - Word Problems (CONTENT-04)
  { grade: 4, domain: 'subtraction', difficulty: 2, question: 'A stadium has 5,000 seats. 3,456 seats are filled. How many seats are empty?', answer: '1544', hints: ['5000 - 3456 = ?'], type: 'word-problem' },
  { grade: 4, domain: 'subtraction', difficulty: 3, question: 'Maria has $10,000 saved. She buys a car for $7,500. How much money does she have left?', answer: '2500', hints: ['10000 - 7500 = ?'], type: 'word-problem' },
  { grade: 4, domain: 'subtraction', difficulty: 4, question: 'A factory produced 25,000 units. They sold 18,765 units. How many units are left?', answer: '6235', hints: ['25000 - 18765 = ?'], type: 'word-problem' },

  // Multiplication - Computation
  { grade: 4, domain: 'multiplication', difficulty: 1, question: 'What is 15 × 3?', answer: '45', hints: ['10 × 3 = 30, 5 × 3 = 15'], type: 'computation' },
  { grade: 4, domain: 'multiplication', difficulty: 2, question: 'What is 23 × 4?', answer: '92', hints: ['20 × 4 = 80, 3 × 4 = 12'], type: 'computation' },
  { grade: 4, domain: 'multiplication', difficulty: 3, question: 'What is 36 × 7?', answer: '252', hints: ['30 × 7 = 210, 6 × 7 = 42'], type: 'computation' },
  { grade: 4, domain: 'multiplication', difficulty: 4, question: 'What is 45 × 12?', answer: '540', hints: ['45 × 10 = 450, 45 × 2 = 90'], type: 'computation' },
  { grade: 4, domain: 'multiplication', difficulty: 5, question: 'What is 67 × 23?', answer: '1541', hints: ['Use the standard algorithm'], type: 'computation' },

  // Multiplication - Word Problems (CONTENT-04)
  { grade: 4, domain: 'multiplication', difficulty: 2, question: 'A box holds 24 bottles. How many bottles are in 6 boxes?', answer: '144', hints: ['6 × 24 = ?'], type: 'word-problem' },
  { grade: 4, domain: 'multiplication', difficulty: 3, question: 'A school bus holds 45 students. How many students can 8 buses hold?', answer: '360', hints: ['8 × 45 = ? Think: 8 × 40 + 8 × 5'], type: 'word-problem' },
  { grade: 4, domain: 'multiplication', difficulty: 4, question: 'Each crate holds 36 oranges. A truck carries 25 crates. How many oranges does the truck carry?', answer: '900', hints: ['25 × 36 = ?'], type: 'word-problem' },
  { grade: 4, domain: 'multiplication', difficulty: 5, question: 'A hotel has 48 rooms on each floor. There are 12 floors. How many rooms does the hotel have?', answer: '576', hints: ['12 × 48 = ?'], type: 'word-problem' },

  // Division - Computation
  { grade: 4, domain: 'division', difficulty: 1, question: 'What is 60 ÷ 5?', answer: '12', hints: ['5 × 12 = 60'], type: 'computation' },
  { grade: 4, domain: 'division', difficulty: 2, question: 'What is 84 ÷ 7?', answer: '12', hints: ['7 × 10 = 70, 7 × 2 = 14'], type: 'computation' },
  { grade: 4, domain: 'division', difficulty: 3, question: 'What is 144 ÷ 12?', answer: '12', hints: ['12 × 12 = ?'], type: 'computation' },
  { grade: 4, domain: 'division', difficulty: 4, question: 'What is 256 ÷ 8?', answer: '32', hints: ['8 × 30 = 240, 8 × 2 = 16'], type: 'computation' },
  { grade: 4, domain: 'division', difficulty: 5, question: 'What is 391 ÷ 17?', answer: '23', hints: ['Try 17 × 20 first'], type: 'computation' },

  // Division - Word Problems (CONTENT-04)
  { grade: 4, domain: 'division', difficulty: 2, question: 'There are 96 books to put equally on 8 shelves. How many books go on each shelf?', answer: '12', hints: ['96 ÷ 8 = ?'], type: 'word-problem' },
  { grade: 4, domain: 'division', difficulty: 3, question: 'A farmer has 156 apples to pack into bags of 12. How many bags can he fill?', answer: '13', hints: ['156 ÷ 12 = ?'], type: 'word-problem' },
  { grade: 4, domain: 'division', difficulty: 4, question: 'A school has 432 students. They are divided equally into 18 classrooms. How many students are in each classroom?', answer: '24', hints: ['432 ÷ 18 = ?'], type: 'word-problem' },
  { grade: 4, domain: 'division', difficulty: 5, question: 'A factory produces 1,560 toys. They package 65 toys per box. How many boxes do they need?', answer: '24', hints: ['1560 ÷ 65 = ?'], type: 'word-problem' },

  // ==========================================================================
  // GRADE 5 (Ages 10-11) - Independent reasoning, coach and extend
  // Focus: Larger numbers, decimals, fractions
  // ==========================================================================

  // Addition - Computation (including fractions)
  { grade: 5, domain: 'addition', difficulty: 1, question: 'What is 2,345 + 1,567?', answer: '3912', hints: ['Add each place value carefully'], type: 'computation' },
  { grade: 5, domain: 'addition', difficulty: 2, question: 'What is 12.5 + 7.8?', answer: '20.3', hints: ['Line up the decimal points'], type: 'computation' },
  { grade: 5, domain: 'addition', difficulty: 3, question: 'What is 3/4 + 1/4?', answer: '1', hints: ['Same denominator, add numerators'], type: 'computation' },
  { grade: 5, domain: 'addition', difficulty: 4, question: 'What is 2/3 + 1/6?', answer: '5/6', hints: ['Find common denominator: 6'], type: 'computation' },
  { grade: 5, domain: 'addition', difficulty: 5, question: 'What is 3/8 + 5/12?', answer: '19/24', hints: ['LCD of 8 and 12 is 24'], type: 'computation' },

  // Addition - Word Problems (CONTENT-04)
  { grade: 5, domain: 'addition', difficulty: 2, question: 'A recipe needs 2.5 cups of flour and 1.75 cups of sugar. How many cups of ingredients is that in total?', answer: '4.25', hints: ['2.5 + 1.75 = ?'], type: 'word-problem' },
  { grade: 5, domain: 'addition', difficulty: 3, question: 'Sam ran 1/2 mile on Monday and 3/4 mile on Tuesday. How far did Sam run in total?', answer: '1 1/4', hints: ['1/2 + 3/4 = ? Find common denominator'], type: 'word-problem' },
  { grade: 5, domain: 'addition', difficulty: 4, question: 'A tank has 15.75 liters of water. 8.5 more liters are added. How many liters are in the tank now?', answer: '24.25', hints: ['15.75 + 8.5 = ?'], type: 'word-problem' },

  // Subtraction - Computation (including fractions)
  { grade: 5, domain: 'subtraction', difficulty: 1, question: 'What is 5,432 - 2,198?', answer: '3234', hints: ['Subtract each place, borrowing as needed'], type: 'computation' },
  { grade: 5, domain: 'subtraction', difficulty: 2, question: 'What is 15.6 - 8.9?', answer: '6.7', hints: ['Line up decimal points'], type: 'computation' },
  { grade: 5, domain: 'subtraction', difficulty: 3, question: 'What is 7/8 - 3/8?', answer: '1/2', hints: ['Same denominator, subtract numerators'], type: 'computation' },
  { grade: 5, domain: 'subtraction', difficulty: 4, question: 'What is 5/6 - 1/3?', answer: '1/2', hints: ['Convert 1/3 to sixths: 2/6'], type: 'computation' },
  { grade: 5, domain: 'subtraction', difficulty: 5, question: 'What is 7/10 - 2/5?', answer: '3/10', hints: ['Convert 2/5 to tenths: 4/10'], type: 'computation' },

  // Subtraction - Word Problems (CONTENT-04)
  { grade: 5, domain: 'subtraction', difficulty: 2, question: 'A rope is 12.5 meters long. If 4.75 meters is cut off, how long is the remaining rope?', answer: '7.75', hints: ['12.5 - 4.75 = ?'], type: 'word-problem' },
  { grade: 5, domain: 'subtraction', difficulty: 3, question: 'Emma had 3/4 of a pizza. She ate 1/4 of the whole pizza. What fraction is left?', answer: '1/2', hints: ['3/4 - 1/4 = ?'], type: 'word-problem' },
  { grade: 5, domain: 'subtraction', difficulty: 4, question: 'A container holds 20.25 kg of rice. 8.8 kg is used. How much rice is left?', answer: '11.45', hints: ['20.25 - 8.8 = ?'], type: 'word-problem' },

  // Multiplication - Computation
  { grade: 5, domain: 'multiplication', difficulty: 1, question: 'What is 35 × 8?', answer: '280', hints: ['30 × 8 = 240, 5 × 8 = 40'], type: 'computation' },
  { grade: 5, domain: 'multiplication', difficulty: 2, question: 'What is 78 × 45?', answer: '3510', hints: ['Use the standard algorithm'], type: 'computation' },
  { grade: 5, domain: 'multiplication', difficulty: 3, question: 'What is 125 × 16?', answer: '2000', hints: ['125 × 8 = 1000, then double'], type: 'computation' },
  { grade: 5, domain: 'multiplication', difficulty: 4, question: 'What is 3/4 × 2/5?', answer: '3/10', hints: ['Multiply numerators, multiply denominators'], type: 'computation' },
  { grade: 5, domain: 'multiplication', difficulty: 5, question: 'What is 234 × 56?', answer: '13104', hints: ['Use partial products'], type: 'computation' },

  // Multiplication - Word Problems (CONTENT-04)
  { grade: 5, domain: 'multiplication', difficulty: 2, question: 'A car travels 65 miles per hour. How far will it travel in 4 hours?', answer: '260', hints: ['65 × 4 = ?'], type: 'word-problem' },
  { grade: 5, domain: 'multiplication', difficulty: 3, question: 'A farmer has 125 apple trees. Each tree produces 48 apples. How many apples in total?', answer: '6000', hints: ['125 × 48 = ?'], type: 'word-problem' },
  { grade: 5, domain: 'multiplication', difficulty: 4, question: 'A recipe needs 2/3 cup of flour. If you make 6 batches, how much flour do you need?', answer: '4', hints: ['6 × 2/3 = ?'], type: 'word-problem' },

  // Division - Computation
  { grade: 5, domain: 'division', difficulty: 1, question: 'What is 450 ÷ 9?', answer: '50', hints: ['9 × 50 = 450'], type: 'computation' },
  { grade: 5, domain: 'division', difficulty: 2, question: 'What is 936 ÷ 12?', answer: '78', hints: ['Use long division'], type: 'computation' },
  { grade: 5, domain: 'division', difficulty: 3, question: 'What is 1440 ÷ 45?', answer: '32', hints: ['45 × 30 = 1350'], type: 'computation' },
  { grade: 5, domain: 'division', difficulty: 4, question: 'What is 2856 ÷ 68?', answer: '42', hints: ['68 × 40 = 2720'], type: 'computation' },
  { grade: 5, domain: 'division', difficulty: 5, question: 'What is 15.6 ÷ 1.2?', answer: '13', hints: ['Multiply both by 10: 156 ÷ 12'], type: 'computation' },

  // Division - Word Problems (CONTENT-04)
  { grade: 5, domain: 'division', difficulty: 2, question: 'There are 756 seats in a theater arranged in 12 equal rows. How many seats are in each row?', answer: '63', hints: ['756 ÷ 12 = ?'], type: 'word-problem' },
  { grade: 5, domain: 'division', difficulty: 3, question: 'A store has 1,560 items to display equally on 24 shelves. How many items go on each shelf?', answer: '65', hints: ['1560 ÷ 24 = ?'], type: 'word-problem' },
  { grade: 5, domain: 'division', difficulty: 4, question: 'A ribbon 8.4 meters long is cut into pieces of 0.6 meters each. How many pieces are there?', answer: '14', hints: ['8.4 ÷ 0.6 = ?'], type: 'word-problem' },

  // ==========================================================================
  // GRADE 6 (Ages 11-12) - Independent reasoning, coach and extend
  // Focus: Percentages, decimals, basic algebra, ratios
  // ==========================================================================

  // Addition - Computation (including algebra)
  { grade: 6, domain: 'addition', difficulty: 1, question: 'What is 45.67 + 32.89?', answer: '78.56', hints: ['Line up decimal points'], type: 'computation' },
  { grade: 6, domain: 'addition', difficulty: 2, question: 'What is 5/6 + 3/8?', answer: '29/24', hints: ['LCD of 6 and 8 is 24'], type: 'computation' },
  { grade: 6, domain: 'addition', difficulty: 3, question: 'What is 2 1/3 + 1 3/4?', answer: '4 1/12', hints: ['Convert to improper fractions first'], type: 'computation' },
  { grade: 6, domain: 'addition', difficulty: 4, question: 'Solve: x + 7 = 15', answer: '8', hints: ['Subtract 7 from both sides'], type: 'computation' },
  { grade: 6, domain: 'addition', difficulty: 5, question: 'Solve: 2x + 5 = 19', answer: '7', hints: ['Subtract 5, then divide by 2'], type: 'computation' },

  // Addition - Word Problems (CONTENT-04)
  { grade: 6, domain: 'addition', difficulty: 2, question: 'A book costs $12.99 plus $3.50 shipping. What is the total cost?', answer: '16.49', hints: ['12.99 + 3.50 = ?'], type: 'word-problem' },
  { grade: 6, domain: 'addition', difficulty: 3, question: 'Tom and Sara collected rocks. Tom has 2 1/4 pounds and Sara has 3 2/3 pounds. How much do they have together?', answer: '5 11/12', hints: ['Convert to common denominators'], type: 'word-problem' },
  { grade: 6, domain: 'addition', difficulty: 4, question: 'A number plus 15 equals 42. What is the number?', answer: '27', hints: ['x + 15 = 42, solve for x'], type: 'word-problem' },

  // Subtraction - Computation (including algebra)
  { grade: 6, domain: 'subtraction', difficulty: 1, question: 'What is 78.45 - 23.67?', answer: '54.78', hints: ['Line up decimal points, borrow as needed'], type: 'computation' },
  { grade: 6, domain: 'subtraction', difficulty: 2, question: 'What is 5/8 - 1/3?', answer: '7/24', hints: ['LCD of 8 and 3 is 24'], type: 'computation' },
  { grade: 6, domain: 'subtraction', difficulty: 3, question: 'What is 4 1/2 - 2 3/4?', answer: '1 3/4', hints: ['Convert to improper fractions'], type: 'computation' },
  { grade: 6, domain: 'subtraction', difficulty: 4, question: 'Solve: x - 12 = 25', answer: '37', hints: ['Add 12 to both sides'], type: 'computation' },
  { grade: 6, domain: 'subtraction', difficulty: 5, question: 'Solve: 3x - 8 = 22', answer: '10', hints: ['Add 8, then divide by 3'], type: 'computation' },

  // Subtraction - Word Problems (CONTENT-04)
  { grade: 6, domain: 'subtraction', difficulty: 2, question: 'A tank had 50.5 gallons. After use, 18.75 gallons remain. How many gallons were used?', answer: '31.75', hints: ['50.5 - 18.75 = ?'], type: 'word-problem' },
  { grade: 6, domain: 'subtraction', difficulty: 3, question: 'A board is 6 1/4 feet long. A piece of 2 5/8 feet is cut off. How long is the remaining board?', answer: '3 5/8', hints: ['Convert to common denominators'], type: 'word-problem' },
  { grade: 6, domain: 'subtraction', difficulty: 4, question: 'A number decreased by 18 equals 45. What is the number?', answer: '63', hints: ['x - 18 = 45, solve for x'], type: 'word-problem' },

  // Multiplication - Computation
  { grade: 6, domain: 'multiplication', difficulty: 1, question: 'What is 4.5 × 6?', answer: '27', hints: ['45 × 6 = 270, then move decimal'], type: 'computation' },
  { grade: 6, domain: 'multiplication', difficulty: 2, question: 'What is 3.2 × 2.5?', answer: '8', hints: ['32 × 25 = 800, then place 2 decimal places'], type: 'computation' },
  { grade: 6, domain: 'multiplication', difficulty: 3, question: 'What is 0.25 × 80?', answer: '20', hints: ['0.25 = 1/4, so divide by 4'], type: 'computation' },
  { grade: 6, domain: 'multiplication', difficulty: 4, question: 'What is 15% of 240?', answer: '36', hints: ['10% = 24, 5% = 12'], type: 'computation' },
  { grade: 6, domain: 'multiplication', difficulty: 5, question: 'Solve: 3x + 7 = 22', answer: '5', hints: ['Subtract 7, then divide by 3'], type: 'computation' },

  // Multiplication - Word Problems (CONTENT-04)
  { grade: 6, domain: 'multiplication', difficulty: 2, question: 'A shirt costs $24.50. What is the cost of 3 shirts?', answer: '73.50', hints: ['24.50 × 3 = ?'], type: 'word-problem' },
  { grade: 6, domain: 'multiplication', difficulty: 3, question: 'A store offers 20% off a $45 item. How much is the discount?', answer: '9', hints: ['20% of 45 = 0.20 × 45'], type: 'word-problem' },
  { grade: 6, domain: 'multiplication', difficulty: 4, question: 'Three times a number plus 4 equals 25. What is the number?', answer: '7', hints: ['3x + 4 = 25, solve for x'], type: 'word-problem' },

  // Division - Computation
  { grade: 6, domain: 'division', difficulty: 1, question: 'What is 45.6 ÷ 8?', answer: '5.7', hints: ['456 ÷ 8 = 57, then place decimal'], type: 'computation' },
  { grade: 6, domain: 'division', difficulty: 2, question: 'What is 18.9 ÷ 2.7?', answer: '7', hints: ['Multiply both by 10: 189 ÷ 27'], type: 'computation' },
  { grade: 6, domain: 'division', difficulty: 3, question: 'What is 3/4 ÷ 1/2?', answer: '1 1/2', hints: ['Multiply by the reciprocal: 3/4 × 2/1'], type: 'computation' },
  { grade: 6, domain: 'division', difficulty: 4, question: 'What is 7.2 ÷ 0.9?', answer: '8', hints: ['Multiply both by 10: 72 ÷ 9'], type: 'computation' },
  { grade: 6, domain: 'division', difficulty: 5, question: 'What is 2.5 × 3.2?', answer: '8', hints: ['25 × 32 = 800, then place decimal'], type: 'computation' },

  // Division - Word Problems (CONTENT-04)
  { grade: 6, domain: 'division', difficulty: 2, question: 'A 12.6 meter ribbon is cut into 7 equal pieces. How long is each piece?', answer: '1.8', hints: ['12.6 ÷ 7 = ?'], type: 'word-problem' },
  { grade: 6, domain: 'division', difficulty: 3, question: 'A recipe makes 3/4 pound of cookies. If you want to make 6 batches, how much cookie dough is that?', answer: '4 1/2', hints: ['6 × 3/4 = ?'], type: 'word-problem' },
  { grade: 6, domain: 'division', difficulty: 4, question: 'A car uses 2.5 gallons for every 50 miles. How many gallons per mile is that?', answer: '0.05', hints: ['2.5 ÷ 50 = ?'], type: 'word-problem' },
  { grade: 6, domain: 'division', difficulty: 5, question: 'If 5 identical items cost $37.50, what is the cost of one item?', answer: '7.50', hints: ['37.50 ÷ 5 = ?'], type: 'word-problem' },
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get questions for a specific grade
 * CONTENT-05: Grade-level filtering - returns only questions appropriate for the grade
 */
export function getQuestionsByGrade(grade: number): DiagnosticQuestionData[] {
  return diagnosticQuestions.filter(q => q.grade === grade)
}

/**
 * Get questions for a grade and domain
 */
export function getQuestionsByGradeAndDomain(grade: number, domain: string): DiagnosticQuestionData[] {
  return diagnosticQuestions.filter(q => q.grade === grade && q.domain === domain)
}

/**
 * Get questions by type (computation or word-problem)
 */
export function getQuestionsByType(grade: number, type: 'computation' | 'word-problem'): DiagnosticQuestionData[] {
  return diagnosticQuestions.filter(q => q.grade === grade && q.type === type)
}

/**
 * Get adaptive next question based on performance
 *
 * ADAPTIVE ALGORITHM:
 * - Correct answer → increase difficulty by 1 (max 5)
 * - Incorrect answer → decrease difficulty by 1 (min 1)
 *
 * This creates a "staircase" pattern that efficiently finds the student's level.
 */
export function getAdaptiveQuestion(
  grade: number,
  domain: string,
  currentDifficulty: number,
  wasCorrect: boolean
): DiagnosticQuestionData | null {
  const newDifficulty = wasCorrect
    ? Math.min(5, currentDifficulty + 1)
    : Math.max(1, currentDifficulty - 1)

  const candidates = diagnosticQuestions.filter(
    q => q.grade === grade && q.domain === domain && q.difficulty === newDifficulty
  )

  if (candidates.length === 0) return null
  return candidates[Math.floor(Math.random() * candidates.length)]
}

/**
 * Calculate recommended difficulty level from diagnostic results
 *
 * LEVEL DETERMINATION ALGORITHM (CONTENT-06):
 * 1. Group all responses by difficulty level (1-5)
 * 2. For each difficulty level, calculate accuracy (correct/total)
 * 3. Find the HIGHEST difficulty where accuracy >= 60%
 * 4. That becomes the student's recommended level for that domain
 *
 * @param results - Array of { difficulty, isCorrect } from diagnostic
 * @returns Recommended difficulty level (1-5)
 */
export function calculateRecommendedLevel(
  results: Array<{ difficulty: number; isCorrect: boolean }>
): number {
  if (results.length === 0) return 3 // Default to medium

  // Group results by difficulty
  const byDifficulty = new Map<number, { correct: number; total: number }>()

  for (const r of results) {
    const current = byDifficulty.get(r.difficulty) || { correct: 0, total: 0 }
    current.total++
    if (r.isCorrect) current.correct++
    byDifficulty.set(r.difficulty, current)
  }

  // Find highest difficulty with ≥60% accuracy
  let recommendedLevel = 1
  for (let d = 1; d <= 5; d++) {
    const stats = byDifficulty.get(d)
    if (stats && stats.correct / stats.total >= 0.6) {
      recommendedLevel = d
    }
  }

  return recommendedLevel
}

/**
 * Get all domains available for a grade
 */
export function getDomainsForGrade(grade: number): string[] {
  const questions = getQuestionsByGrade(grade)
  return [...new Set(questions.map(q => q.domain))]
}

/**
 * Get question count summary by grade and domain
 */
export function getQuestionStats(): Map<number, Map<string, number>> {
  const stats = new Map<number, Map<string, number>>()

  for (const q of diagnosticQuestions) {
    if (!stats.has(q.grade)) {
      stats.set(q.grade, new Map())
    }
    const gradeStats = stats.get(q.grade)!
    gradeStats.set(q.domain, (gradeStats.get(q.domain) || 0) + 1)
  }

  return stats
}
