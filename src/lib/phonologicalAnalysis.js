/**
 * Advanced Phonological Analysis Utilities
 * Provides linguistic-based phoneme weakness detection for dyslexia intervention
 */

// IPA-based phoneme classifications
export const PHONEME_CATEGORIES = {
  fricatives: ["f", "v", "th", "s", "z", "sh", "zh", "h"],
  affricates: ["ch", "dH", "tch"],
  stops: ["p", "b", "t", "d", "k", "g"],
  nasals: ["m", "n", "ng"],
  liquids: ["l", "r"],
  glides: ["w", "y", "wh"],
  vowels: ["ay", "ai", "ea", "ee", "igh", "oa", "ow", "u", "oo"],
  blends: ["bl", "br", "cl", "cr", "dr", "fl", "fr", "gl", "gr", "pl", "pr", "st", "tr", "sc", "sk", "sm", "sn", "sp", "sw"],
};

// Common dyslexic weakness patterns
export const WEAKNESS_PATTERNS = {
  "voiced-voiceless-confusion": {
    pairs: [["b", "p"], ["d", "t"], ["g", "k"], ["v", "f"], ["z", "s"]],
    description: "Difficulty distinguishing between voiced and voiceless consonants",
    severity: "high",
  },
  "fricative-weakness": {
    phonemes: ["f", "v", "th", "s", "z", "sh", "zh"],
    description: "Struggles with fricative consonants requiring sustained airflow",
    severity: "high",
  },
  "liquid-confusion": {
    pairs: [["l", "r"]],
    description: "Difficulty distinguishing between /l/ and /r/ sounds",
    severity: "medium",
  },
  "blend-difficulty": {
    type: "consonant-clusters",
    description: "Trouble with consonant blends (bl, cr, st, etc.)",
    severity: "high",
  },
  "vowel-digraph-confusion": {
    phonemes: ["ai", "ay", "ea", "ee"],
    description: "Difficulty with vowel digraphs and long vowel patterns",
    severity: "medium",
  },
};

/**
 * Analyze word for phoneme components
 */
export function extractPhonemes(word) {
  const lower = word.toLowerCase().replace(/[^a-z]/g, "");
  const phonemes = [];
  const checked = new Set();

  const phonemePatterns = [
    "tch", "ch", "sh", "zh", "th", "ng", "ck", "ph", "gh", "wh", "qu",
    "ai", "ay", "ea", "ee", "igh", "oa", "ow", "oo",
    "b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "w", "y", "z",
    "a", "e", "i", "o", "u",
  ];

  let pos = 0;
  while (pos < lower.length) {
    let matched = false;

    for (const phoneme of phonemePatterns) {
      if (lower.substr(pos, phoneme.length) === phoneme && !checked.has(`${pos}-${phoneme}`)) {
        phonemes.push({ phoneme, position: pos });
        checked.add(`${pos}-${phoneme}`);
        pos += phoneme.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      pos += 1;
    }
  }

  return phonemes;
}

/**
 * Identify phoneme weaknesses from error patterns
 */
export function identifyWeaknesses(phonemeErrors) {
  const weaknesses = [];

  WEAKNESS_PATTERNS["voiced-voiceless-confusion"].pairs.forEach(([voiced, voiceless]) => {
    const voicedErrors = phonemeErrors[voiced] || 0;
    const voicelessErrors = phonemeErrors[voiceless] || 0;
    if (voicedErrors > 2 || voicelessErrors > 2) {
      weaknesses.push({
        type: "voiced-voiceless-confusion",
        phonemes: [voiced, voiceless],
        severity: voicedErrors > 5 || voicelessErrors > 5 ? "critical" : "high",
      });
    }
  });

  const fricativeErrors = WEAKNESS_PATTERNS["fricative-weakness"].phonemes.reduce(
    (sum, ph) => sum + (phonemeErrors[ph] || 0),
    0
  );
  if (fricativeErrors > 5) {
    weaknesses.push({
      type: "fricative-weakness",
      severity: fricativeErrors > 10 ? "critical" : "high",
      errorCount: fricativeErrors,
    });
  }

  const liquidErrors = (phonemeErrors["l"] || 0) + (phonemeErrors["r"] || 0);
  if (liquidErrors > 3) {
    weaknesses.push({
      type: "liquid-confusion",
      severity: liquidErrors > 6 ? "high" : "medium",
      errorCount: liquidErrors,
    });
  }

  const vowelErrors = Object.keys(phonemeErrors).filter(
    (ph) => WEAKNESS_PATTERNS["vowel-digraph-confusion"].phonemes.includes(ph)
  ).length;
  if (vowelErrors > 2) {
    weaknesses.push({
      type: "vowel-digraph-confusion",
      severity: vowelErrors > 3 ? "high" : "medium",
    });
  }

  return weaknesses;
}

/**
 * Calculate phonological processing score
 */
export function calculatePhonologicalScore(phonemeErrors, totalPhonemes = 25) {
  const totalErrors = Object.values(phonemeErrors).reduce((sum, count) => sum + count, 0);
  const averageErrorsPerPhoneme = totalErrors / totalPhonemes;
  const score = Math.max(0, 100 - averageErrorsPerPhoneme * 8);
  return Number(score.toFixed(1));
}

/**
 * Get phoneme difficulty level
 */
export function getPhonemeLevel(phoneme) {
  const easyPhonemes = ["m", "n", "p", "b", "t", "d", "f", "v"];
  const mediumPhonemes = ["k", "g", "l", "w", "y", "s", "z"];
  const hardPhonemes = ["r", "th", "sh", "zh", "ch"];

  if (easyPhonemes.includes(phoneme)) return "easy";
  if (mediumPhonemes.includes(phoneme)) return "medium";
  if (hardPhonemes.includes(phoneme)) return "hard";
  return "medium";
}

export default {
  PHONEME_CATEGORIES,
  WEAKNESS_PATTERNS,
  extractPhonemes,
  identifyWeaknesses,
  calculatePhonologicalScore,
  getPhonemeLevel,
};
