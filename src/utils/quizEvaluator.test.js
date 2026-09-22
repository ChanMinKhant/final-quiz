import { evaluateAnswer, countBlanks, normalizeText, formatCorrectAnswer } from './quizEvaluator.js';
import { shuffleArray } from './shuffle.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('--- Testing normalizeText ---');
assert(normalizeText('  Fair  ') === 'fair', 'Trims and lowercases');
assert(normalizeText('offer,  offer') === 'offer, offer', 'Normalizes commas with space');
assert(normalizeText('planning   - the strategy') === 'planning - the strategy', 'Normalizes dash spacing');
assert(normalizeText('was closed/was being repaired') === 'was closed / was being repaired', 'Normalizes slash spacing');

console.log('\n--- Testing countBlanks ---');
assert(countBlanks('To be _______ and _______') === 2, 'Counts 2 blanks');
assert(countBlanks('Single blank _______ here') === 1, 'Counts 1 blank');

console.log('\n--- Testing formatCorrectAnswer ---');
assert(formatCorrectAnswer('RSA') === 'RSA', 'Single string formatted as-is');
assert(formatCorrectAnswer(['have arrested']) === 'have arrested', 'Single item array formatted as item');
assert(formatCorrectAnswer(['is packed', 'has been packed']) === 'is packed  or  has been packed', 'Multi-item array joined with "or"');

console.log('\n--- Testing evaluateAnswer: MCQ ---');
const mcqQ = { type: 'mcq', answer: 'RSA', options: ['AES', 'DES', 'RSA', 'Blowfish'] };
assert(evaluateAnswer('RSA', mcqQ).isCorrect === true, 'MCQ exact match is correct');
assert(evaluateAnswer('rsa', mcqQ).isCorrect === true, 'MCQ case-insensitive match is correct');
assert(evaluateAnswer('AES', mcqQ).isCorrect === false, 'MCQ incorrect choice is false');

console.log('\n--- Testing evaluateAnswer: True / False ---');
const tfQ = { type: 'true_false', answer: 'False', options: ['True', 'False'] };
assert(evaluateAnswer('False', tfQ).isCorrect === true, 'T/F exact match is correct');
assert(evaluateAnswer('false', tfQ).isCorrect === true, 'T/F lowercase match is correct');
assert(evaluateAnswer('True', tfQ).isCorrect === false, 'T/F wrong choice is false');

console.log('\n--- Testing evaluateAnswer: Single Answer Fill-in ---');
const fillQ1 = { type: 'fill_blank', answer: 'fair' };
assert(evaluateAnswer('fair', fillQ1).isCorrect === true, 'Single word exact match');
assert(evaluateAnswer('  FAIR  ', fillQ1).isCorrect === true, 'Single word with extra spaces and uppercase');
assert(evaluateAnswer('unfair', fillQ1).isCorrect === false, 'Single word wrong answer');

const fillQ3 = { type: 'fill_blank', answer: 'offer, offer' };
assert(evaluateAnswer('offer, offer', fillQ3).isCorrect === true, 'Multi-blank exact comma separated');
assert(evaluateAnswer('offer,offer', fillQ3).isCorrect === true, 'Multi-blank comma without space');
assert(evaluateAnswer('  OFFER ,  offer  ', fillQ3).isCorrect === true, 'Multi-blank comma with irregular spaces');
assert(evaluateAnswer('offer, deal', fillQ3).isCorrect === false, 'Multi-blank with incorrect second word');

const fillQ13 = { type: 'fill_blank', answer: 'planning - the strategy - team roles - the issues' };
assert(evaluateAnswer('planning - the strategy - team roles - the issues', fillQ13).isCorrect === true, 'Multi-part hyphen exact');
assert(evaluateAnswer('planning-the strategy-team roles-the issues', fillQ13).isCorrect === true, 'Multi-part hyphen tight spacing');
assert(evaluateAnswer('planning, the strategy, team roles, the issues', fillQ13).isCorrect === true, 'Multi-part comma equivalent');

console.log('\n--- Testing evaluateAnswer: Multiple Acceptable Answers (Grammar Tutorial) ---');
// Q2: ["is packed", "has been packed"]
const grammarQ2 = {
  type: 'fill_blank',
  answer: ['is packed', 'has been packed']
};
assert(evaluateAnswer('is packed', grammarQ2).isCorrect === true, 'Grammar Q2: matches first acceptable answer');
assert(evaluateAnswer('has been packed', grammarQ2).isCorrect === true, 'Grammar Q2: matches second acceptable answer');
assert(evaluateAnswer('IS PACKED', grammarQ2).isCorrect === true, 'Grammar Q2: case-insensitive match');
assert(evaluateAnswer('was packed', grammarQ2).isCorrect === false, 'Grammar Q2: invalid tense rejected');

// Q3: ["washing", "needs to be washed", "to be washed"]
const grammarQ3 = {
  type: 'fill_blank',
  answer: ['washing', 'needs to be washed', 'to be washed']
};
assert(evaluateAnswer('washing', grammarQ3).isCorrect === true, 'Grammar Q3: option 1 (washing)');
assert(evaluateAnswer('needs to be washed', grammarQ3).isCorrect === true, 'Grammar Q3: option 2 (needs to be washed)');
assert(evaluateAnswer('to be washed', grammarQ3).isCorrect === true, 'Grammar Q3: option 3 (to be washed)');
assert(evaluateAnswer('washed', grammarQ3).isCorrect === false, 'Grammar Q3: incorrect form');

// Q11: ["isn't raining", "is not raining"]
const grammarQ11 = {
  type: 'fill_blank',
  answer: ["isn't raining", "is not raining"]
};
assert(evaluateAnswer("isn't raining", grammarQ11).isCorrect === true, 'Grammar Q11: contraction accepted');
assert(evaluateAnswer("is not raining", grammarQ11).isCorrect === true, 'Grammar Q11: expanded form accepted');
assert(evaluateAnswer("isn’t raining", grammarQ11).isCorrect === true, 'Grammar Q11: smart curly apostrophe accepted');

// Q17: ["was closed / was being repaired", "was closed, was being repaired"]
const grammarQ17 = {
  type: 'fill_blank',
  answer: ['was closed / was being repaired', 'was closed, was being repaired']
};
assert(evaluateAnswer('was closed / was being repaired', grammarQ17).isCorrect === true, 'Grammar Q17: slash version');
assert(evaluateAnswer('was closed, was being repaired', grammarQ17).isCorrect === true, 'Grammar Q17: comma version');
assert(evaluateAnswer('was closed,was being repaired', grammarQ17).isCorrect === true, 'Grammar Q17: tight comma');
assert(evaluateAnswer('was closed/was being repaired', grammarQ17).isCorrect === true, 'Grammar Q17: tight slash');

console.log('\n--- Testing Fisher-Yates shuffleArray ---');
const sampleArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const shuffled = shuffleArray(sampleArray);
assert(shuffled.length === sampleArray.length, 'Shuffled length matches original');
assert(sampleArray.every((item) => shuffled.includes(item)), 'All original elements preserved');
assert(sampleArray !== shuffled, 'Returns a new array instance without mutating original');

console.log('\n✨ ALL TESTS INCLUDING MULTIPLE ACCEPTABLE ANSWERS PASSED! ✨\n');
