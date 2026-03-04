function extractJsonFromText(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const braceStart = text.indexOf("{");
  const braceEnd = text.lastIndexOf("}");
  if (braceStart >= 0 && braceEnd > braceStart) {
    return text.slice(braceStart, braceEnd + 1);
  }

  const bracketStart = text.indexOf("[");
  const bracketEnd = text.lastIndexOf("]");
  if (bracketStart >= 0 && bracketEnd > bracketStart) {
    return text.slice(bracketStart, bracketEnd + 1);
  }

  return text.trim();
}

export async function generateGeminiText(prompt, config = {}) {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-1.5-flash";

  if (!apiKey) {
    return config.fallback ?? "";
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: config.temperature ?? 0.4,
          maxOutputTokens: 1200,
        },
      }),
    },
  );

  if (!response.ok) {
    if (config.fallback !== undefined) {
      return config.fallback;
    }
    throw new Error(`Gemini request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    return config.fallback ?? "";
  }

  return text;
}

export async function generateGeminiJson(prompt, fallback, config = {}) {
  const raw = await generateGeminiText(prompt, {
    ...config,
    fallback: JSON.stringify(fallback),
  });

  try {
    return JSON.parse(extractJsonFromText(raw));
  } catch {
    return fallback;
  }
}
