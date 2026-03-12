"""
iSteer E-Commerce — Authentication Server
Flask + SQLite backend
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3, hashlib, os, re, secrets, datetime

app = Flask(__name__, static_folder='..', static_url_path='')
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'database', 'isteer.db')


# ── DB HELPER ────────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create tables if they don't exist."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db()
    conn.executescript(open(
        os.path.join(os.path.dirname(__file__), '..', 'database', 'users.sql')
    ).read())
    conn.commit()
    conn.close()


# ── UTILITIES ────────────────────────────────────────────
def hash_password(password: str, salt: str = None):
    if salt is None:
        salt = secrets.token_hex(16)
    pw_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 260_000).hex()
    return pw_hash, salt


def is_valid_email(email: str) -> bool:
    return bool(re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email.strip()))


# ── ROUTES ───────────────────────────────────────────────

@app.route('/')
def index():
    return send_from_directory('..', 'index.html')


@app.route('/server/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}

    first_name  = (data.get('firstName') or '').strip()
    last_name   = (data.get('lastName')  or '').strip()
    email       = (data.get('email')     or '').strip().lower()
    password    = data.get('password')   or ''
    newsletter  = bool(data.get('newsletter', False))

    # Validation
    if not first_name or not last_name:
        return jsonify({'message': 'First and last name are required.'}), 400
    if not is_valid_email(email):
        return jsonify({'message': 'Invalid email address.'}), 400
    if len(password) < 8:
        return jsonify({'message': 'Password must be at least 8 characters.'}), 400

    conn = get_db()
    try:
        existing = conn.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
        if existing:
            return jsonify({'message': 'An account with this email already exists.'}), 409

        pw_hash, salt = hash_password(password)
        conn.execute(
            '''INSERT INTO users (first_name, last_name, email, password_hash, salt, newsletter, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)''',
            (first_name, last_name, email, pw_hash, salt, newsletter,
             datetime.datetime.utcnow().isoformat())
        )
        conn.commit()
        return jsonify({'message': 'Account created successfully.'}), 201
    finally:
        conn.close()


@app.route('/server/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}

    email    = (data.get('email')    or '').strip().lower()
    password = data.get('password')  or ''

    if not is_valid_email(email) or not password:
        return jsonify({'message': 'Email and password are required.'}), 400

    conn = get_db()
    try:
        user = conn.execute(
            'SELECT * FROM users WHERE email = ?', (email,)
        ).fetchone()

        if not user:
            return jsonify({'message': 'Invalid email or password.'}), 401

        pw_hash, _ = hash_password(password, user['salt'])
        if pw_hash != user['password_hash']:
            return jsonify({'message': 'Invalid email or password.'}), 401

        # Update last login
        conn.execute(
            'UPDATE users SET last_login = ? WHERE id = ?',
            (datetime.datetime.utcnow().isoformat(), user['id'])
        )
        conn.commit()

        return jsonify({
            'message': 'Login successful.',
            'user': {
                'id':         user['id'],
                'firstName':  user['first_name'],
                'lastName':   user['last_name'],
                'email':      user['email'],
            }
        }), 200
    finally:
        conn.close()


@app.route('/server/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'iSteer Auth'}), 200


# ── ENTRY POINT ──────────────────────────────────────────
if __name__ == '__main__':
    init_db()
    print('iSteer server running at http://localhost:5000')
    app.run(debug=True, port=5000)