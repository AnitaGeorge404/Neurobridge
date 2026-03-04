import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.js";
import { generateGeminiJson } from "../_shared/gemini.js";

const fallbackPlan = {
  summary: "Steady, confidence-building progression across reading, phoneme work, and writing.",
  days: [
    {
      day: "Day 1",
      readingExercise: "Read a 120-word paragraph slowly and highlight 5 difficult words.",
      phonemeDrill: "Practice /th/ minimal pairs for 10 minutes.",
      writingTask: "Write 5 sentences using today's phoneme words.",
      encouragement: "Small consistent effort builds strong fluency.",
    },
    {
      day: "Day 2",
      readingExercise: "Read the same paragraph with smoother pacing.",
      phonemeDrill: "Sort words by target phoneme.",
      writingTask: "Rewrite one sentence with clearer structure.",
      encouragement: "Progress is visible when you compare sessions.",
    },
  ],
};

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

async function buildPlanForUser(admin, userId) {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekStartIso = weekStart.toISOString();

  const { data: sessions } = await admin
    .from("reading_sessions")
    .select("id, wpm, original_text, simplified_text, created_at")
    .eq("user_id", userId)
    .gte("created_at", weekStartIso)
    .order("created_at", { ascending: true });

  const { data: dominantPhoneme } = await admin
    .from("phoneme_errors")
    .select("phoneme, error_count")
    .eq("user_id", userId)
    .order("error_count", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sessionIds = (sessions ?? []).map((session) => session.id).filter(Boolean);

  let writingErrorFrequency = 0;
  if (sessionIds.length > 0) {
    const { count } = await admin
      .from("word_metrics")
      .select("id", { count: "exact", head: true })
      .in("session_id", sessionIds)
      .gt("reread_count", 0);

    writingErrorFrequency = count ?? 0;
  }

  const validWpms = (sessions ?? [])
    .map((session) => Number(session.wpm))
    .filter((value) => Number.isFinite(value) && value > 0);

  const avgWpm = validWpms.length
    ? validWpms.reduce((sum, value) => sum + value, 0) / validWpms.length
    : 0;

  const readingSpeedScore = clamp((avgWpm / 180) * 100);
  const phonologicalScore = clamp(100 - Number(dominantPhoneme?.error_count ?? 0) * 8);
  const writingStabilityScore = clamp(100 - writingErrorFrequency * 5);
  const confidenceTrend = clamp(
    readingSpeedScore * 0.4 + phonologicalScore * 0.35 + writingStabilityScore * 0.25,
  );

  const phoneme = dominantPhoneme?.phoneme ?? "th";
  const prompt = `Based on these metrics:
- Avg WPM: ${avgWpm.toFixed(2)}
- Dominant phoneme weakness: ${phoneme}
- Writing error frequency: ${writingErrorFrequency}

Generate a 7-day structured dyslexia improvement plan.
Include:
- Daily reading exercise
- Phoneme drill
- Writing task
- Encouraging feedback

Return strict JSON with shape:
{
  "summary": "...",
  "days": [
    {"day":"Day 1","readingExercise":"...","phonemeDrill":"...","writingTask":"...","encouragement":"..."}
  ]
}`;

  const generatedPlan = await generateGeminiJson(prompt, fallbackPlan, {
    temperature: 0.5,
  });

  const payload = {
    user_id: userId,
    reading_speed_score: Number(readingSpeedScore.toFixed(2)),
    phonological_score: Number(phonologicalScore.toFixed(2)),
    writing_stability_score: Number(writingStabilityScore.toFixed(2)),
    confidence_trend: Number(confidenceTrend.toFixed(2)),
    generated_plan: generatedPlan,
  };

  const { data: stored, error: insertError } = await admin
    .from("cognitive_profiles")
    .insert(payload)
    .select("*")
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return {
    avgWpm: Number(avgWpm.toFixed(2)),
    dominantPhonemeWeakness: phoneme,
    writingErrorFrequency,
    profile: stored,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase environment variables" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const cronSecret = Deno.env.get("CRON_SECRET");
    const headerSecret = req.headers.get("x-cron-secret");
    const isCronRequest = Boolean(cronSecret && headerSecret && cronSecret === headerSecret);

    if (isCronRequest) {
      const [sessionsUsersRes, phonemeUsersRes] = await Promise.all([
        admin.from("reading_sessions").select("user_id").not("user_id", "is", null),
        admin.from("phoneme_errors").select("user_id").not("user_id", "is", null),
      ]);

      const userIds = new Set();
      for (const row of sessionsUsersRes.data ?? []) {
        if (row.user_id) userIds.add(row.user_id);
      }
      for (const row of phonemeUsersRes.data ?? []) {
        if (row.user_id) userIds.add(row.user_id);
      }

      const results = [];
      for (const userId of userIds) {
        try {
          const result = await buildPlanForUser(admin, userId);
          results.push({ userId, ok: true, ...result });
        } catch (error) {
          results.push({
            userId,
            ok: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return new Response(JSON.stringify({ mode: "cron", count: results.length, results }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await buildPlanForUser(admin, user.id);

    return new Response(JSON.stringify({ mode: "user", ...result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
