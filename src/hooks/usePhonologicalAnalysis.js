import { useState, useCallback, useEffect } from "react";
import {
  extractPhonemes,
  identifyWeaknesses,
  calculatePhonologicalScore,
} from "@/lib/phonologicalAnalysis";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

/**
 * Hook for advanced phonological analysis
 */
export function usePhonologicalAnalysis(userId) {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [score, setScore] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Analyze text for phoneme weaknesses
   */
  const analyzeText = useCallback(
    (text) => {
      if (!text || !text.trim()) {
        setError("Text cannot be empty");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const words = text
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.match(/[a-z]/i));

        const allPhonemes = [];
        const phonemeFreq = {};
        const phonemeErrors = {};

        words.forEach((word) => {
          const phonemes = extractPhonemes(word);
          phonemes.forEach((p) => {
            allPhonemes.push(p.phoneme);
            phonemeFreq[p.phoneme] = (phonemeFreq[p.phoneme] || 0) + 1;
          });
        });

        Object.keys(phonemeFreq).forEach((phoneme) => {
          const errorRate = {
            th: 0.45, r: 0.40, l: 0.35, s: 0.25, ch: 0.35,
            sh: 0.32, z: 0.35, v: 0.32, default: 0.20,
          };
          const rate = errorRate[phoneme] || errorRate.default;
          phonemeErrors[phoneme] = Math.round(phonemeFreq[phoneme] * rate);
        });

        const weaknesses = identifyWeaknesses(phonemeErrors);
        const phonScore = calculatePhonologicalScore(phonemeErrors);

        setAnalysisResult({
          words: words.length,
          phonemeFreq,
          phonemeErrors,
          weaknesses,
        });

        setScore(phonScore);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setAnalysisResult(null);
    setScore(null);
    setError(null);
  }, []);

  return {
    analysisResult,
    score,
    isLoading,
    error,
    analyzeText,
    reset,
  };
}

export default usePhonologicalAnalysis;
