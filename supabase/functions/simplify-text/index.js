import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.js";
import { generateGeminiText } from "../_shared/gemini.js";

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

    const supabase = createClient(supabaseUrl, anonKey);
    const body = await req.json();
    const originalText = (body?.originalText ?? "").toString().trim();
    const sessionId = body?.sessionId?.toString();

    if (!originalText) {
      return new Response(JSON.stringify({ error: "originalText is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Rewrite this text in simpler language for a dyslexic learner.
- Keep meaning unchanged
- Shorten sentences
- Use simpler vocabulary
- Avoid complex clauses

Text:\n${originalText}`;

    const simplifiedText = await generateGeminiText(prompt, {
      temperature: 0.3,
      fallback: originalText,
    });

    if (sessionId) {
      const { error: updateError } = await supabase
        .from("reading_sessions")
        .update({ simplified_text: simplifiedText })
        .eq("id", sessionId)
        .eq("user_id", user.id);

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ simplifiedText }), {
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
