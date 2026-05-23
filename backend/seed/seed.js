import 'dotenv/config';
import mongoose from 'mongoose';
import Problem from '../models/Problem.js';

const problems = [
  {
    code: 'P001', name: 'Hello World', difficulty: 'Easy',
    statement: 'Write a program that prints exactly:\nHello, World!\n\nThere are no inputs. Your output must match exactly (case-sensitive).',
    testCases: [{ input: '', output: 'Hello, World!' }],
  },
  {
    code: 'P002', name: 'Sum of Two Numbers', difficulty: 'Easy',
    statement: 'Given two integers A and B on a single line separated by a space, print their sum.\n\nConstraints: -10^9 <= A, B <= 10^9',
    testCases: [{ input: '3 7', output: '10' }, { input: '-5 5', output: '0' }, { input: '1000000000 1000000000', output: '2000000000' }],
  },
  {
    code: 'P003', name: 'Fibonacci Sequence', difficulty: 'Medium',
    statement: 'Given an integer N, print the first N Fibonacci numbers separated by spaces.\nThe sequence starts: 0 1 1 2 3 5 8 13 ...\n\nConstraints: 1 <= N <= 30',
    testCases: [{ input: '5', output: '0 1 1 2 3' }, { input: '1', output: '0' }, { input: '8', output: '0 1 1 2 3 5 8 13' }],
  },
  {
    code: 'P004', name: 'Absolute Difference', difficulty: 'Easy',
    statement: 'Given two integers A and B, print the absolute difference between them.\n\nConstraints: -10^9 <= A, B <= 10^9',
    testCases: [{ input: '3 7', output: '4' }, { input: '-5 5', output: '10' }, { input: '100 100', output: '0' }, { input: '0 1000000000', output: '1000000000' }],
  },
  {
    code: 'P005', name: 'FizzBuzz', difficulty: 'Easy',
    statement: 'Print the numbers from 1 to N, each on a new line.\nFor multiples of 3 print "Fizz", multiples of 5 print "Buzz", both print "FizzBuzz".\n\nConstraints: 1 <= N <= 100',
    testCases: [{ input: '5', output: '1\n2\nFizz\n4\nBuzz' }, { input: '15', output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz' }],
  },
  {
    code: 'P006', name: 'Max of Three', difficulty: 'Easy',
    statement: 'Given three integers A, B, and C, print the largest of the three.\n\nConstraints: -10^9 <= A, B, C <= 10^9',
    testCases: [{ input: '1 2 3', output: '3' }, { input: '5 3 4', output: '5' }, { input: '-1 -2 -3', output: '-1' }],
  },
  {
    code: 'P007', name: 'Power', difficulty: 'Easy',
    statement: 'Given base B and exponent E, compute B^E.\n\nConstraints: 0 <= B, E <= 9',
    testCases: [{ input: '2 10', output: '1024' }, { input: '3 4', output: '81' }, { input: '5 0', output: '1' }, { input: '0 5', output: '0' }],
  },
  {
    code: 'P008', name: 'GCD', difficulty: 'Medium',
    statement: 'Given two positive integers A and B, find their GCD.\n\nHint: GCD(a, b) = GCD(b, a % b), with GCD(a, 0) = a.\n\nConstraints: 1 <= A, B <= 10^9',
    testCases: [{ input: '12 8', output: '4' }, { input: '100 75', output: '25' }, { input: '7 13', output: '1' }, { input: '1000000000 999999999', output: '1' }],
  },
  {
    code: 'P009', name: 'Is Prime', difficulty: 'Medium',
    statement: 'Given a positive integer N, determine whether it is prime.\n\nConstraints: 1 <= N <= 10^6\n\nOutput YES or NO.',
    testCases: [{ input: '7', output: 'YES' }, { input: '4', output: 'NO' }, { input: '1', output: 'NO' }, { input: '97', output: 'YES' }, { input: '1000000', output: 'NO' }],
  },
  {
    code: 'P010', name: 'Digit Sum', difficulty: 'Easy',
    statement: 'Given a non-negative integer N, find the sum of all its digits.\n\nConstraints: 0 <= N <= 10^9',
    testCases: [{ input: '123', output: '6' }, { input: '999', output: '27' }, { input: '0', output: '0' }, { input: '1000000000', output: '1' }],
  },

  // ── New problems ──────────────────────────────────────────────────────────

  {
    code: 'P011', name: 'Reverse String', difficulty: 'Easy',
    statement: 'Given a single string S (no spaces, only lowercase letters), print the reverse of S.\n\nConstraints: 1 <= |S| <= 1000',
    testCases: [
      { input: 'hello',   output: 'olleh' },
      { input: 'abcdef',  output: 'fedcba' },
      { input: 'a',       output: 'a' },
      { input: 'racecar', output: 'racecar' },
    ],
  },
  {
    code: 'P012', name: 'Count Vowels', difficulty: 'Easy',
    statement: 'Given a string S of lowercase letters, count the number of vowels (a, e, i, o, u).\n\nConstraints: 1 <= |S| <= 1000',
    testCases: [
      { input: 'hello',       output: '2' },
      { input: 'aeiou',       output: '5' },
      { input: 'xyz',         output: '0' },
      { input: 'programming', output: '3' },
    ],
  },
  {
    code: 'P013', name: 'Palindrome Check', difficulty: 'Easy',
    statement: 'Given a string S (lowercase, no spaces), print YES if it is a palindrome, or NO otherwise.\n\nA palindrome reads the same forwards and backwards.\n\nConstraints: 1 <= |S| <= 1000',
    testCases: [
      { input: 'racecar', output: 'YES' },
      { input: 'hello',   output: 'NO' },
      { input: 'a',       output: 'YES' },
      { input: 'abba',    output: 'YES' },
      { input: 'abcd',    output: 'NO' },
    ],
  },
  {
    code: 'P014', name: 'Array Sum', difficulty: 'Easy',
    statement: 'Given N integers, print their sum.\n\nInput format:\n- First line: N\n- Second line: N space-separated integers\n\nConstraints: 1 <= N <= 10^5, -10^9 <= each integer <= 10^9',
    testCases: [
      { input: '3\n1 2 3',          output: '6' },
      { input: '5\n-1 -2 3 4 -5',   output: '-1' },
      { input: '1\n1000000',        output: '1000000' },
      { input: '4\n0 0 0 0',        output: '0' },
    ],
  },
  {
    code: 'P015', name: 'Second Largest', difficulty: 'Easy',
    statement: 'Given N distinct integers, print the second largest value.\n\nInput format:\n- First line: N\n- Second line: N space-separated distinct integers\n\nConstraints: 2 <= N <= 100, -10^9 <= each integer <= 10^9',
    testCases: [
      { input: '5\n3 1 4 5 2',  output: '4' },
      { input: '3\n10 20 30',   output: '20' },
      { input: '2\n100 1',      output: '1' },
      { input: '4\n-4 -3 -2 -1', output: '-2' },
    ],
  },
  {
    code: 'P016', name: 'LCM', difficulty: 'Easy',
    statement: 'Given two positive integers A and B, print their Least Common Multiple (LCM).\n\nHint: LCM(a, b) = (a * b) / GCD(a, b)\n\nConstraints: 1 <= A, B <= 10^6',
    testCases: [
      { input: '4 6',    output: '12' },
      { input: '12 8',   output: '24' },
      { input: '7 13',   output: '91' },
      { input: '100 75', output: '300' },
    ],
  },
  {
    code: 'P017', name: 'Count Set Bits', difficulty: 'Easy',
    statement: 'Given a non-negative integer N, count the number of 1-bits in its binary representation (also known as the Hamming weight or popcount).\n\nExample: 7 in binary is 111, so the answer is 3.\n\nConstraints: 0 <= N <= 10^9',
    testCases: [
      { input: '0',    output: '0' },
      { input: '1',    output: '1' },
      { input: '7',    output: '3' },
      { input: '255',  output: '8' },
      { input: '1023', output: '10' },
    ],
  },
  {
    code: 'P018', name: 'Binary Search', difficulty: 'Medium',
    statement: 'Given a sorted array of N distinct integers and a target T, print the 1-indexed position of T in the array. If T is not present, print -1.\n\nInput format:\n- First line: N\n- Second line: N space-separated integers in sorted (ascending) order\n- Third line: T\n\nConstraints: 1 <= N <= 10^5, -10^9 <= integers, T <= 10^9',
    testCases: [
      { input: '5\n1 3 5 7 9\n5',  output: '3' },
      { input: '5\n1 3 5 7 9\n4',  output: '-1' },
      { input: '4\n2 4 6 8\n2',    output: '1' },
      { input: '4\n2 4 6 8\n8',    output: '4' },
      { input: '1\n42\n42',         output: '1' },
    ],
  },
  {
    code: 'P019', name: 'Anagram Check', difficulty: 'Medium',
    statement: 'Given two strings A and B (lowercase letters only), print YES if they are anagrams of each other, or NO otherwise.\n\nTwo strings are anagrams if one can be formed by rearranging the letters of the other.\n\nInput format:\n- First line: A\n- Second line: B\n\nConstraints: 1 <= |A|, |B| <= 1000',
    testCases: [
      { input: 'listen\nsilent', output: 'YES' },
      { input: 'hello\nworld',   output: 'NO' },
      { input: 'abc\ncba',       output: 'YES' },
      { input: 'ab\ncd',         output: 'NO' },
      { input: 'aab\naba',       output: 'YES' },
    ],
  },
  {
    code: 'P020', name: 'Two Sum', difficulty: 'Medium',
    statement: 'Given an array of N integers and a target T, find two distinct indices (1-indexed) whose values sum to T. Print the two indices in ascending order on a single line separated by a space.\n\nIt is guaranteed that exactly one solution exists.\n\nInput format:\n- First line: N\n- Second line: N space-separated integers\n- Third line: T\n\nConstraints: 2 <= N <= 10^4',
    testCases: [
      { input: '4\n2 7 11 15\n9',  output: '1 2' },
      { input: '3\n3 2 4\n6',      output: '2 3' },
      { input: '4\n1 3 4 5\n9',    output: '3 4' },
      { input: '2\n3 3\n6',        output: '1 2' },
    ],
  },
  {
    code: 'P021', name: 'Balanced Parentheses', difficulty: 'Medium',
    statement: 'Given a string S consisting only of \'(\' and \')\' characters, print YES if the parentheses are balanced, or NO otherwise.\n\nParentheses are balanced if every opening bracket has a corresponding closing bracket in the correct order.\n\nConstraints: 0 <= |S| <= 10^5',
    testCases: [
      { input: '(())',  output: 'YES' },
      { input: '(()',   output: 'NO' },
      { input: '()()',  output: 'YES' },
      { input: ')',     output: 'NO' },
      { input: '(()())', output: 'YES' },
    ],
  },
  {
    code: 'P022', name: 'Staircase Sum', difficulty: 'Easy',
    statement: 'Given a positive integer N, compute the sum 1 + 2 + 3 + ... + N.\n\nConstraints: 1 <= N <= 10000\n\nHint: The sum equals N*(N+1)/2.',
    testCases: [
      { input: '1',     output: '1' },
      { input: '10',    output: '55' },
      { input: '100',   output: '5050' },
      { input: '10000', output: '50005000' },
    ],
  },
  {
    code: 'P023', name: 'Longest Common Subsequence', difficulty: 'Hard',
    statement: 'Given two strings A and B, find the length of their Longest Common Subsequence (LCS).\n\nA subsequence is a sequence that can be derived from another sequence by deleting some elements without changing the order of the remaining elements.\n\nInput format:\n- First line: A\n- Second line: B\n\nConstraints: 1 <= |A|, |B| <= 500, strings consist of uppercase and lowercase letters',
    testCases: [
      { input: 'abcde\nace',     output: '3' },
      { input: 'abc\nabc',       output: '3' },
      { input: 'abc\ndef',       output: '0' },
      { input: 'AGGTAB\nGXTXAYB', output: '4' },
    ],
  },
  {
    code: 'P024', name: 'Coin Change', difficulty: 'Hard',
    statement: 'Given N coin denominations and a target amount S, find the minimum number of coins needed to make exactly S. If it is impossible, print -1.\n\nYou have an unlimited supply of each coin denomination.\n\nInput format:\n- First line: N S\n- Second line: N space-separated coin denominations\n\nConstraints: 1 <= N <= 20, 0 <= S <= 10000, 1 <= each coin <= 10000',
    testCases: [
      { input: '3 11\n1 5 6',  output: '2' },
      { input: '3 7\n2 3 4',   output: '2' },
      { input: '2 3\n2 4',     output: '-1' },
      { input: '1 0\n1',       output: '0' },
      { input: '3 100\n1 5 6', output: '17' },
    ],
  },
  {
    code: 'P025', name: '0/1 Knapsack', difficulty: 'Hard',
    statement: 'You have a knapsack of capacity C and N items. Each item has a weight W and value V. You can take each item at most once. Find the maximum total value you can carry without exceeding the capacity.\n\nInput format:\n- First line: N C\n- Next N lines: W_i V_i (weight and value of item i)\n\nConstraints: 1 <= N <= 100, 1 <= C <= 1000, 1 <= W_i, V_i <= 1000',
    testCases: [
      { input: '3 50\n10 60\n20 100\n30 120',  output: '220' },
      { input: '4 5\n1 1\n2 6\n3 10\n4 16',   output: '17' },
      { input: '1 1\n2 10',                    output: '0' },
      { input: '2 10\n5 10\n4 40',             output: '50' },
    ],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Problem.deleteMany({});
  await Problem.insertMany(problems);
  console.log(`Seeded ${problems.length} problems.`);
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
