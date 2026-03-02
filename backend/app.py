from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Any

from flask import Flask, jsonify, request

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "neurobridge.db"

app = Flask(__name__)


def db_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with db_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                module TEXT NOT NULL,
                category TEXT NOT NULL,
                payload TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )


@app.after_request
def apply_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route("/api/health", methods=["GET"])
def health() -> Any:
    return jsonify({"status": "ok"})


@app.route("/api/<module>/<category>", methods=["GET", "POST", "OPTIONS"])
def module_records(module: str, category: str) -> Any:
    if request.method == "OPTIONS":
        return ("", 204)

    if request.method == "GET":
        with db_connection() as conn:
            rows = conn.execute(
                """
                SELECT id, payload, created_at
                FROM records
                WHERE module = ? AND category = ?
                ORDER BY id DESC
                """,
                (module, category),
            ).fetchall()

        records = []
        for row in rows:
            payload = json.loads(row["payload"])
            payload["id"] = row["id"]
            payload["created_at"] = row["created_at"]
            records.append(payload)
        return jsonify(records)

    payload = request.get_json(silent=True) or {}

    with db_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO records (module, category, payload)
            VALUES (?, ?, ?)
            """,
            (module, category, json.dumps(payload)),
        )

        created = conn.execute(
            """
            SELECT id, payload, created_at
            FROM records
            WHERE id = ?
            """,
            (cursor.lastrowid,),
        ).fetchone()

    result = json.loads(created["payload"])
    result["id"] = created["id"]
    result["created_at"] = created["created_at"]
    return jsonify(result), 201


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
