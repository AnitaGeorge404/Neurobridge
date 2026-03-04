from __future__ import annotations

import json
import os
import time
from datetime import UTC, datetime, timedelta
from typing import Any

import google.generativeai as genai
from bson import ObjectId
from flask import Flask, Response, jsonify, request
from pymongo import DESCENDING, MongoClient

app = Flask(__name__)

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "neurobridge")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

mongo_client = MongoClient(MONGODB_URI)
db = mongo_client[MONGO_DB_NAME]

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


def now_utc() -> datetime:
    return datetime.now(UTC)


def to_json_ready(document: dict[str, Any]) -> dict[str, Any]:
    if not document:
        return document
    normalized = {**document}
    if "_id" in normalized and isinstance(normalized["_id"], ObjectId):
        normalized["_id"] = str(normalized["_id"])
    if "timestamp" in normalized and isinstance(normalized["timestamp"], datetime):
        normalized["timestamp"] = normalized["timestamp"].isoformat()
    return normalized


def call_gemini(prompt: str, fallback: str) -> str:
    if not GEMINI_API_KEY:
        return fallback
    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(prompt)
        text = (response.text or "").strip()
        return text or fallback
    except Exception:
        return fallback


def reading_comfort_score(wpm: float, dwell: float, rereads: int, regressions: int) -> float:
    speed_score = max(0, min(100, (wpm / 220) * 100))
    dwell_penalty = min(30, dwell * 8)
    behavior_penalty = min(35, rereads * 3 + regressions * 4)
    score = speed_score - dwell_penalty - behavior_penalty
    return round(max(0, min(100, score)), 2)


def weekly_range() -> tuple[datetime, datetime]:
    end = now_utc()
    start = end - timedelta(days=7)
    return start, end


def create_indexes() -> None:
    db.reading_sessions.create_index([("userId", DESCENDING), ("timestamp", DESCENDING)])
    db.phonology_logs.create_index([("userId", DESCENDING), ("timestamp", DESCENDING)])
    db.reinforcement_events.create_index([("userId", DESCENDING), ("timestamp", DESCENDING)])
    db.writing_sessions.create_index([("userId", DESCENDING), ("timestamp", DESCENDING)])
    db.learning_profiles.create_index([("userId", DESCENDING)], unique=True)


@app.after_request
def apply_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route("/api/health", methods=["GET"])
def health() -> Any:
    return jsonify(
        {
            "status": "ok",
            "database": MONGO_DB_NAME,
            "gemini_enabled": bool(GEMINI_API_KEY),
            "platform": "AI-Powered Neuroadaptive Dyslexia Intervention Platform",
        }
    )


@app.route("/api/dyslexia/reading/session", methods=["POST", "OPTIONS"])
def create_reading_session() -> Any:
    if request.method == "OPTIONS":
        return ("", 204)

    payload = request.get_json(silent=True) or {}
    user_id = payload.get("userId", "anonymous")
    text_id = payload.get("textId", "unknown")
    paragraph = payload.get("paragraph", "")
    wpm = float(payload.get("wpm", 0))
    word_dwell_time = float(payload.get("wordDwellTime", 0))
    reread_segments = payload.get("rereadSegments", [])
    hesitation_words = payload.get("hesitationWords", [])
    scroll_regressions = int(payload.get("scrollRegressions", 0))
    hesitation_threshold = float(payload.get("hesitationThreshold", 2.5))

    needs_simplification = word_dwell_time > hesitation_threshold or len(hesitation_words) > 2
    simplified_paragraph = paragraph
    if paragraph and needs_simplification:
        simplify_prompt = (
            "Rewrite this paragraph in simpler language suitable for a dyslexic learner without "
            "changing meaning. Keep sentence count similar. Paragraph:\n\n"
            f"{paragraph}"
        )
        simplified_paragraph = call_gemini(simplify_prompt, paragraph)

    comfort_score = reading_comfort_score(
        wpm=wpm,
        dwell=word_dwell_time,
        rereads=len(reread_segments),
        regressions=scroll_regressions,
    )

    session = {
        "userId": user_id,
        "textId": text_id,
        "wpm": wpm,
        "wordDwellTime": word_dwell_time,
        "hesitationWords": hesitation_words,
        "rereadSegments": reread_segments,
        "scrollRegressions": scroll_regressions,
        "readingComfortScore": comfort_score,
        "simplified": needs_simplification,
        "simplifiedParagraph": simplified_paragraph,
        "timestamp": now_utc(),
    }

    inserted = db.reading_sessions.insert_one(session)
    session["_id"] = inserted.inserted_id
    session = to_json_ready(session)
    return jsonify(session), 201


@app.route("/api/dyslexia/reading/insights/<user_id>", methods=["GET"])
def get_reading_insights(user_id: str) -> Any:
    start, end = weekly_range()
    rows = list(
        db.reading_sessions.find(
            {"userId": user_id, "timestamp": {"$gte": start, "$lte": end}}
        ).sort("timestamp", DESCENDING)
    )

    if not rows:
        return jsonify(
            {
                "readingComfortScore": 0,
                "averageWpm": 0,
                "topHesitationWords": [],
                "weeklyInsight": "Complete at least one reading session to get weekly insights.",
            }
        )

    avg_score = sum(r.get("readingComfortScore", 0) for r in rows) / len(rows)
    avg_wpm = sum(r.get("wpm", 0) for r in rows) / len(rows)
    word_counter: dict[str, int] = {}
    for item in rows:
        for word in item.get("hesitationWords", []):
            word_counter[word] = word_counter.get(word, 0) + 1

    top_words = sorted(word_counter.items(), key=lambda x: x[1], reverse=True)[:7]
    weekly_context = {
        "avgComfort": round(avg_score, 2),
        "avgWpm": round(avg_wpm, 2),
        "topWords": top_words,
        "sessions": len(rows),
    }

    insight_prompt = (
        "Generate concise weekly dyslexia reading progress insights from this JSON. "
        "Focus on measurable progress, struggle patterns, and 3 practical actions. JSON:\n"
        f"{json.dumps(weekly_context)}"
    )
    insight_text = call_gemini(
        insight_prompt,
        "Your reading comfort is improving. Continue daily 10-minute sessions, focus on hesitation words, and use simplified mode for dense paragraphs.",
    )

    return jsonify(
        {
            "readingComfortScore": round(avg_score, 2),
            "averageWpm": round(avg_wpm, 2),
            "topHesitationWords": top_words,
            "weeklyInsight": insight_text,
        }
    )


@app.route("/api/dyslexia/phonology/log", methods=["POST", "OPTIONS"])
def log_phonology_errors() -> Any:
    if request.method == "OPTIONS":
        return ("", 204)

    payload = request.get_json(silent=True) or {}
    doc = {
        "userId": payload.get("userId", "anonymous"),
        "phonemeErrorPattern": payload.get("phonemeErrorPattern", {}),
        "exerciseContext": payload.get("exerciseContext", "general"),
        "timestamp": now_utc(),
    }
    inserted = db.phonology_logs.insert_one(doc)
    doc["_id"] = inserted.inserted_id
    return jsonify(to_json_ready(doc)), 201


@app.route("/api/dyslexia/phonology/drills", methods=["POST", "OPTIONS"])
def generate_phonology_drills() -> Any:
    if request.method == "OPTIONS":
        return ("", 204)

    payload = request.get_json(silent=True) or {}
    user_id = payload.get("userId", "anonymous")
    age = int(payload.get("age", 14))
    focus = payload.get("focus", "long vowel confusion")

    recent_logs = list(
        db.phonology_logs.find({"userId": user_id}).sort("timestamp", DESCENDING).limit(20)
    )
    aggregate: dict[str, int] = {}
    for item in recent_logs:
        for key, value in item.get("phonemeErrorPattern", {}).items():
            aggregate[key] = aggregate.get(key, 0) + int(value)

    prompt = (
        f"Generate 10 targeted phoneme training exercises focusing on {focus} for a dyslexic learner aged {age}. "
        "Use this error summary JSON to personalize drill progression and keep instructions short:\n"
        f"{json.dumps(aggregate)}"
    )
    generated = call_gemini(
        prompt,
        "1) Sort words by long vowel sound. 2) Choose correct long vowel in context. 3) Read minimal pairs aloud. "
        "4) Fill missing long vowel grapheme. 5) Match audio to spelling. 6) Blend onset+rime cards. "
        "7) Identify silent-e words. 8) Build words from phoneme tiles. 9) Dictation with immediate replay. "
        "10) Re-read corrected list and self-check.",
    )

    return jsonify({"userId": user_id, "focus": focus, "errorSummary": aggregate, "drills": generated})


@app.route("/api/dyslexia/reinforcement/event", methods=["POST", "OPTIONS"])
def track_reinforcement_event() -> Any:
    if request.method == "OPTIONS":
        return ("", 204)

    payload = request.get_json(silent=True) or {}
    doc = {
        "userId": payload.get("userId", "anonymous"),
        "sessionId": payload.get("sessionId", "session-1"),
        "phase": payload.get("phase", "Read"),
        "word": payload.get("word", ""),
        "latencyMs": int(payload.get("latencyMs", 0)),
        "timestamp": now_utc(),
    }
    inserted = db.reinforcement_events.insert_one(doc)
    doc["_id"] = inserted.inserted_id
    return jsonify(to_json_ready(doc)), 201


@app.route("/api/dyslexia/writing/analyze", methods=["POST", "OPTIONS"])
def analyze_writing() -> Any:
    if request.method == "OPTIONS":
        return ("", 204)

    payload = request.get_json(silent=True) or {}
    user_id = payload.get("userId", "anonymous")
    text = payload.get("text", "")

    prompt = (
        "This text contains phonetic spelling typical of dyslexia. Correct it gently and explain each correction "
        "in simple terms. Keep tone encouraging and avoid shaming language. Return a short JSON object with keys "
        "correctedText, corrections (array with original/corrected/explanation), and encouragement. Text:\n"
        f"{text}"
    )
    generated = call_gemini(prompt, "")

    result: dict[str, Any]
    try:
        result = json.loads(generated)
    except Exception:
        result = {
            "correctedText": text,
            "corrections": [],
            "encouragement": "Great effort. You are improving with every sentence.",
        }

    result_doc = {
        "userId": user_id,
        "sourceText": text,
        "correctedText": result.get("correctedText", text),
        "corrections": result.get("corrections", []),
        "encouragement": result.get(
            "encouragement", "Great effort. You are improving with every sentence."
        ),
        "timestamp": now_utc(),
    }
    db.writing_sessions.insert_one(result_doc)
    return jsonify(to_json_ready(result_doc))


@app.route("/api/dyslexia/profile/<user_id>", methods=["GET"])
def get_learning_profile(user_id: str) -> Any:
    start, end = weekly_range()
    reading = list(
        db.reading_sessions.find(
            {"userId": user_id, "timestamp": {"$gte": start, "$lte": end}}
        )
    )
    phonology = list(
        db.phonology_logs.find(
            {"userId": user_id, "timestamp": {"$gte": start, "$lte": end}}
        )
    )
    writing = list(
        db.writing_sessions.find(
            {"userId": user_id, "timestamp": {"$gte": start, "$lte": end}}
        )
    )
    reinforcement = list(
        db.reinforcement_events.find(
            {"userId": user_id, "timestamp": {"$gte": start, "$lte": end}}
        )
    )

    avg_wpm = (sum(item.get("wpm", 0) for item in reading) / len(reading)) if reading else 0
    reading_speed_score = round(max(0, min(100, (avg_wpm / 220) * 100)), 2)

    total_phoneme_errors = 0
    phoneme_buckets: dict[str, int] = {}
    for item in phonology:
        for key, value in item.get("phonemeErrorPattern", {}).items():
            phoneme_buckets[key] = phoneme_buckets.get(key, 0) + int(value)
            total_phoneme_errors += int(value)
    phonological_accuracy_score = round(max(0, 100 - total_phoneme_errors), 2)

    visual_discrimination_score = round(
        max(0, 100 - sum(item.get("scrollRegressions", 0) for item in reading) * 4), 2
    )

    writing_stability_score = round(max(0, 100 - len(writing) * 2), 2)
    confidence_trend_score = round(
        max(0, min(100, (reading_speed_score + phonological_accuracy_score + visual_discrimination_score) / 3)),
        2,
    )

    dominant_weakness = "long vowel confusion"
    if phoneme_buckets:
        dominant_weakness = max(phoneme_buckets, key=phoneme_buckets.get)

    stored_profile = db.learning_profiles.find_one({"userId": user_id})
    prev_confidence = (stored_profile or {}).get("confidenceTrendScore", confidence_trend_score)
    improvement_rate = round(confidence_trend_score - prev_confidence, 2)

    metrics = {
        "readingSpeedScore": reading_speed_score,
        "phonologicalAccuracyScore": phonological_accuracy_score,
        "visualDiscriminationScore": visual_discrimination_score,
        "writingStabilityScore": writing_stability_score,
        "confidenceTrendScore": confidence_trend_score,
        "dominantWeakness": dominant_weakness,
        "improvementRate": f"{improvement_rate}%",
    }

    plan_prompt = (
        "Based on these metrics, generate a 7-day personalized cognitive training plan for a dyslexic student. "
        "Keep each day concrete with reading, phonology, writing, and confidence-building tasks. Metrics JSON:\n"
        f"{json.dumps(metrics)}"
    )
    recommended_plan = call_gemini(
        plan_prompt,
        "Day 1: 12-min guided reading + long vowel drill. Day 2: multisensory read-hear-build loop. "
        "Day 3: writing correction journal. Day 4: reread fluency sprint. Day 5: phoneme blend practice. "
        "Day 6: comprehension with simplified text. Day 7: reflection and confidence recap.",
    )

    profile = {
        "userId": user_id,
        "readingSpeedScore": reading_speed_score,
        "phonologicalAccuracyScore": phonological_accuracy_score,
        "visualDiscriminationScore": visual_discrimination_score,
        "writingStabilityScore": writing_stability_score,
        "confidenceTrendScore": confidence_trend_score,
        "dominantWeakness": dominant_weakness,
        "improvementRate": f"{improvement_rate}%",
        "recommendedTrainingPlan": recommended_plan,
        "eventVolume": {
            "readingSessions": len(reading),
            "phonologyLogs": len(phonology),
            "writingSessions": len(writing),
            "reinforcementEvents": len(reinforcement),
        },
        "timestamp": now_utc(),
    }

    db.learning_profiles.update_one(
        {"userId": user_id}, {"$set": profile}, upsert=True
    )
    return jsonify(to_json_ready(profile))


@app.route("/api/dyslexia/analytics/stream/<user_id>", methods=["GET"])
def stream_analytics(user_id: str) -> Response:
    def generate():
        while True:
            start, _ = weekly_range()
            total_reading = db.reading_sessions.count_documents(
                {"userId": user_id, "timestamp": {"$gte": start}}
            )
            total_phonology = db.phonology_logs.count_documents(
                {"userId": user_id, "timestamp": {"$gte": start}}
            )
            last_session = db.reading_sessions.find_one(
                {"userId": user_id}, sort=[("timestamp", DESCENDING)]
            )

            payload = {
                "userId": user_id,
                "weekReadingSessions": total_reading,
                "weekPhonologyEvents": total_phonology,
                "latestComfortScore": (last_session or {}).get("readingComfortScore", 0),
                "timestamp": now_utc().isoformat(),
            }
            yield f"data: {json.dumps(payload)}\n\n"
            time.sleep(2)

    return Response(generate(), mimetype="text/event-stream")


@app.route("/api/dyspraxia/decompose", methods=["POST"])
def decompose_task() -> Response:
    """
    Module A — Dynamic Task Decomposition Engine
    Implements φ:(Q,C)→G where:
      Q = user goal (natural language)
      C = context vector (anxiety_level, fatigue_level)
      G = ordered micro-step sequence with granularity scaled to C

    Higher anxiety/fatigue → more granular steps, shorter sentences,
    motor-first instructions (stand, walk, reach) rather than cognitive.
    """
    import re

    data = request.get_json(force=True) or {}
    goal: str = (data.get("goal") or "").strip()
    anxiety: int = max(1, min(10, int(data.get("anxietyLevel", 5))))
    fatigue: int = max(1, min(10, int(data.get("fatigueLevel", 5))))

    if not goal:
        return jsonify({"error": "goal is required"}), 400

    # φ mapping — composite context score drives granularity
    context_score = (anxiety + fatigue) / 2.0  # 1–10

    if context_score >= 7:
        granularity_desc = (
            "extremely tiny physical actions, 3-5 words each, up to 12 steps. "
            "Focus on body movements: stand, walk, reach, touch, lift. "
            "No cognitive instructions. DCD-friendly motor sequencing."
        )
        max_steps = 12
    elif context_score >= 4:
        granularity_desc = (
            "small, clear single-action steps, 5-9 words each, 6-10 steps. "
            "Physical actions only, one thing at a time."
        )
        max_steps = 10
    else:
        granularity_desc = (
            "concise steps, up to 12 words each, 4-7 steps."
        )
        max_steps = 7

    prompt = (
        f'You are a Dyspraxia (DCD) and OCD support assistant.\n'
        f'The user wants to accomplish: "{goal}".\n'
        f'Current anxiety level: {anxiety}/10. Current fatigue level: {fatigue}/10.\n\n'
        f'Break this into micro-steps that are {granularity_desc}\n'
        f'Rules:\n'
        f'- Each step must be ONE concrete, physical action.\n'
        f'- No motivational language, no praise, no meta-commentary.\n'
        f'- NEVER use numbered lists or bullet points.\n'
        f'- Return ONLY a JSON array of strings, nothing else.\n'
        f'- Maximum {max_steps} steps.\n\n'
        f'Example for "Make tea": ["Walk to the kitchen", "Fill the kettle", '
        f'"Switch the kettle on", "Place a mug on the counter", '
        f'"Put a teabag in the mug", "Pour water when ready"]'
    )

    fallback_steps = [
        f"Think about what you need for: {goal}",
        "Gather anything you need nearby",
        "Take one slow breath",
        "Begin the very first part",
        "Pause and rest if needed",
        "Continue at your own pace",
    ]

    raw = call_gemini(prompt, "[]")

    try:
        match = re.search(r"\[.*?\]", raw, re.DOTALL)
        steps = json.loads(match.group(0)) if match else []
        if not isinstance(steps, list) or len(steps) == 0:
            steps = fallback_steps
        steps = [str(s).strip() for s in steps if str(s).strip()][:max_steps]
    except Exception:
        steps = fallback_steps

    db.dyspraxia_decompositions.insert_one({
        "goal": goal,
        "anxietyLevel": anxiety,
        "fatigueLevel": fatigue,
        "contextScore": context_score,
        "steps": steps,
        "timestamp": now_utc(),
    })

    return jsonify({
        "goal": goal,
        "anxietyLevel": anxiety,
        "fatigueLevel": fatigue,
        "contextScore": round(context_score, 1),
        "steps": steps,
        "timestamp": now_utc().isoformat(),
    })


if __name__ == "__main__":
    create_indexes()
    app.run(host="0.0.0.0", port=5000, debug=True)
