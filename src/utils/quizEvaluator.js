/**
 * Normalizes text for comparison by trimming, lowercasing,
 * collapsing spaces, standardizing quotes, and standardizing delimiter spacing.
 *
 * @param {string} str
 * @returns {string}
 */
export function normalizeText(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .toLowerCase()
    // Replace curved/smart quotes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // Standardize slashes with surrounding spaces
    .replace(/\s*\/\s*/g, ' / ')
    // Normalize commas with single trailing space
    .replace(/\s*,\s*/g, ', ')
    // Normalize hyphens/dashes with standard spacing
    .replace(/\s*-\s*/g, ' - ')
    // Collapse extra spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Counts the number of blanks (represented by underscores) in a question string.
 *
 * @param {string} question
 * @returns {number}
 */
export function countBlanks(question) {
  if (!question) return 1;
  const matches = question.match(/_{2,}/g);
  return matches ? matches.length : 1;
}

/**
 * Formats one or multiple answers into a clean human-readable string.
 * E.g. ["is packed", "has been packed"] -> "is packed  or  has been packed"
 *
 * @param {string | string[]} answer
 * @returns {string}
 */
export function formatCorrectAnswer(answer) {
  if (Array.isArray(answer)) {
    if (answer.length === 0) return '';
    if (answer.length === 1) return answer[0];
    return answer.join('  or  ');
  }
  return String(answer || '');
}

/**
 * Compares user answer against a single target option string.
 *
 * @param {string} userStr
 * @param {string} targetStr
 * @param {string} type
 * @returns {boolean}
 */
function compareSingleOption(userStr, targetStr, type) {
  if (type === 'mcq' || type === 'true_false') {
    return userStr.trim().toLowerCase() === targetStr.trim().toLowerCase();
  }

  const normUser = normalizeText(userStr);
  const normTarget = normalizeText(targetStr);

  // Exact normalized match
  if (normUser === normTarget) {
    return true;
  }

  // Multi-part comparison if target contains delimiters (commas, slashes, hyphens)
  const delimiterRegex = /[,/-]/;
  if (delimiterRegex.test(normTarget)) {
    const userParts = normUser.split(delimiterRegex).map((p) => normalizeText(p)).filter(Boolean);
    const targetParts = normTarget.split(delimiterRegex).map((p) => normalizeText(p)).filter(Boolean);

    if (
      userParts.length === targetParts.length &&
      userParts.every((part, idx) => part === targetParts[idx])
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Evaluates whether the user's answer matches any of the accepted answers for the given question.
 * Supports both single string answer and array of multiple acceptable answers.
 *
 * @param {string} userAnswer - The user's input or selection
 * @param {object} question - The question object containing answer and type
 * @returns {{ isCorrect: boolean, matchedAnswer: string | null, displayAnswer: string, allAnswers: string[] }}
 */
export function evaluateAnswer(userAnswer, question) {
  if (!question || question.answer === undefined || question.answer === null) {
    return {
      isCorrect: false,
      matchedAnswer: null,
      displayAnswer: '',
      allAnswers: []
    };
  }

  const user = String(userAnswer || '');
  const rawAnswer = question.answer;
  const candidates = Array.isArray(rawAnswer) ? rawAnswer : [rawAnswer];
  const displayAnswer = formatCorrectAnswer(rawAnswer);

  for (const candidate of candidates) {
    const targetStr = String(candidate || '');
    if (compareSingleOption(user, targetStr, question.type)) {
      return {
        isCorrect: true,
        matchedAnswer: targetStr,
        displayAnswer,
        allAnswers: candidates
      };
    }
  }

  return {
    isCorrect: false,
    matchedAnswer: null,
    displayAnswer,
    allAnswers: candidates
  };
}
