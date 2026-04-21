from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import requests
import json

from db import get_db
from config import OLLAMA_URL

app = Flask(__name__)

# 🔥 FIX: allow React fully
CORS(app, resources={r"/*": {"origins": "*"}})


# ----------------------------
# HEALTH CHECK
# ----------------------------
@app.route("/")
def home():
    return jsonify({"status": "Backend running 🚀"})


# ----------------------------
# CREATE CHAT
# ----------------------------
@app.route("/new_chat", methods=["POST"])
def new_chat():
    db = get_db()
    cur = db.cursor()

    cur.execute(
        "INSERT INTO chats (user_id, title) VALUES (%s, %s)",
        (1, "New Chat")
    )

    db.commit()
    chat_id = cur.lastrowid

    cur.close()
    db.close()

    return jsonify({"chat_id": chat_id})


# ----------------------------
# GET CHATS
# ----------------------------
@app.route("/chats")
def chats():
    try:
        db = get_db()
        cur = db.cursor()

        cur.execute("""
            SELECT id, title
            FROM chats
            WHERE is_deleted = 0 OR is_deleted IS NULL
            ORDER BY created_at DESC
        """)

        data = cur.fetchall()

        cur.close()
        db.close()

        return jsonify([{"id": c[0], "title": c[1]} for c in data])

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ----------------------------
# SEARCH
# ----------------------------
@app.route("/search")
def search():
    q = request.args.get("q", "")

    db = get_db()
    cur = db.cursor()

    cur.execute("""
        SELECT id, title
        FROM chats
        WHERE title LIKE %s
        AND (is_deleted = 0 OR is_deleted IS NULL)
        ORDER BY created_at DESC
    """, (f"%{q}%",))

    data = cur.fetchall()

    cur.close()
    db.close()

    return jsonify([{"id": c[0], "title": c[1]} for c in data])


# ----------------------------
# MESSAGES
# ----------------------------
@app.route("/messages/<int:chat_id>")
def messages(chat_id):
    db = get_db()
    cur = db.cursor()

    cur.execute("""
        SELECT role, text
        FROM messages
        WHERE chat_id=%s
        ORDER BY id ASC
    """, (chat_id,))

    data = cur.fetchall()

    cur.close()
    db.close()

    return jsonify([{"role": r[0], "text": r[1]} for r in data])


# ----------------------------
# RENAME
# ----------------------------
@app.route("/rename_chat/<int:chat_id>", methods=["PUT"])
def rename_chat(chat_id):
    data = request.json
    title = data.get("title")

    if not title:
        return jsonify({"error": "Title required"}), 400

    db = get_db()
    cur = db.cursor()

    cur.execute(
        "UPDATE chats SET title=%s WHERE id=%s",
        (title, chat_id)
    )

    db.commit()

    cur.close()
    db.close()

    return jsonify({"success": True})


# ----------------------------
# DELETE
# ----------------------------
@app.route("/delete_chat/<int:chat_id>", methods=["DELETE"])
def delete_chat(chat_id):
    db = get_db()
    cur = db.cursor()

    cur.execute(
        "UPDATE chats SET is_deleted=1 WHERE id=%s",
        (chat_id,)
    )

    db.commit()

    cur.close()
    db.close()

    return jsonify({"success": True})


# ----------------------------
# UNDO DELETE
# ----------------------------
@app.route("/undo_delete/<int:chat_id>", methods=["POST"])
def undo_delete(chat_id):
    db = get_db()
    cur = db.cursor()

    cur.execute(
        "UPDATE chats SET is_deleted=0 WHERE id=%s",
        (chat_id,)
    )

    db.commit()

    cur.close()
    db.close()

    return jsonify({"success": True})


# ----------------------------
# STREAM CHAT
# ----------------------------
@app.route("/chat_stream", methods=["POST"])
def chat_stream():
    data = request.json
    msg = data.get("message")
    chat_id = data.get("chat_id")

    if not msg:
        return jsonify({"error": "Message required"}), 400

    def generate():
        db = get_db()
        cur = db.cursor()

        cur.execute(
            "INSERT INTO messages (chat_id, role, text) VALUES (%s,%s,%s)",
            (chat_id, "user", msg)
        )
        db.commit()

        full_response = ""

        try:
            res = requests.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": "phi3:mini",
                    "prompt": msg,
                    "stream": True
                },
                stream=True,
                timeout=120
            )

            for line in res.iter_lines():
                if line:
                    chunk = json.loads(line)
                    token = chunk.get("response", "")
                    full_response += token
                    yield token

        except Exception as e:
            yield f"[ERROR: {str(e)}]"
            full_response = str(e)

        cur.execute(
            "INSERT INTO messages (chat_id, role, text) VALUES (%s,%s,%s)",
            (chat_id, "ai", full_response)
        )

        db.commit()

        cur.close()
        db.close()

    return Response(generate(), mimetype="text/plain")


# ----------------------------
# RUN
# ----------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)