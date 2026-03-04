import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.js";
import { generateGeminiJson } from "../_shared/gemini.js";

const fallbackDrills = {
  focus: "th",
  fillBlank: [
    {
      prompt: "I am ___inking about my plan.",
      options: ["th", "f", "s"],
      answer: "th",
    },
    {
      prompt: "Please pass me the ___read.",
      options: ["ch", "th", "wh"],
      answer: "th",
    },
  ],
  wordBuild: {
    targetWord: "thinking",
    chunks: ["thin", "k", "ing"],
    hint: "Build from left to right and say each chunk aloud.",
  },
  soundMatch: [
    {
      prompt: "Pick the chunk that sounds like /th/",
      choices: ["th", "sh", "ch"],
      answer: "th",
    },
    {
      prompt: "Pick the word that starts with /th/",
      choices: ["think", "sink", "wink"],
      answer: "think",
    },
  ],
};

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
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !anonKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase environment variables" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    let dominantPhoneme = (body?.dominantPhoneme ?? "").toString().trim();

    if (!dominantPhoneme) {
      const { data: topPhoneme } = await supabase
        .from("phoneme_errors")
        .select("phoneme")
        .eq("user_id", user.id)
        .order("error_count", { ascending: false })
        .limit(1)
        .maybeSingle();

      dominantPhoneme = topPhoneme?.phoneme ?? "th";
    }

    const prompt = `You are a dyslexia intervention assistant.
Generate a JSON object for structured drills focused on phoneme '${dominantPhoneme}'.
Return strict JSON with keys:
- focus: string
- fillBlank: [{ prompt: string, options: string[], answer: string }]
- wordBuild: { targetWord: string, chunks: string[], hint: string }
- soundMatch: [{ prompt: string, choices: string[], answer: string }]

Rules:
- Include 2 fillBlank items
- Include 2 soundMatch items
- Keep language child-friendly and concise
- Ensure options include the correct answer exactly`;

    const drills = await generateGeminiJson(prompt, {
      ...fallbackDrills,
      focus: dominantPhoneme,
    });

    return new Response(JSON.stringify({ dominantPhoneme, drills }), {
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
