# iSteer — E-Commerce Login & Signup System

> Premium, full-stack authentication for the iSteer e-commerce platform.

---

## Project Structure

```
Login_signup_for_E_commerce/
├── index.html          # Landing page
├── login.html          # Sign-in page
├── signup.html         # Registration page
├── css/
│   └── style.css       # Complete design system (dark, gold-accent)
├── js/
│   └── script.js       # Validation, password strength, toast, API calls
├── server/
│   └── app.py          # Flask REST API (register, login, health)
├── database/
│   └── users.sql       # SQLite schema
└── README.md
```

---

## Features

- **Dark luxury UI** — Playfair Display + DM Sans, gold accent system
- **Responsive** — works on mobile, tablet, and desktop
- **Live form validation** — email, password, confirm-password, required fields
- **Password strength meter** — 4-level bar indicator
- **Password visibility toggle** — per-field show/hide
- **Loading states** — spinner on submit buttons
- **Toast notifications** — success & error feedback
- **Social login UI** — Google & Facebook placeholders
- **Secure backend** — PBKDF2-SHA256 password hashing with per-user salt
- **SQLite database** — zero-configuration, file-based

---

## Quick Start

### 1. Install dependencies

```bash
pip install flask flask-cors
```

### 2. Run the server

```bash
cd server
python app.py
```

Server starts at **http://localhost:5000**

### 3. Open in browser

Navigate to `http://localhost:5000` — or open `index.html` directly for frontend-only demo mode.

---

## API Endpoints

| Method | Endpoint           | Description          |
|--------|--------------------|----------------------|
| POST   | `/server/register` | Create a new account |
| POST   | `/server/login`    | Authenticate user    |
| GET    | `/server/health`   | Server health check  |

### Register — Request Body
```json
{
  "firstName": "Alex",
  "lastName": "Jordan",
  "email": "alex@example.com",
  "password": "SecurePass@1",
  "newsletter": true
}
```

### Login — Request Body
```json
{
  "email": "alex@example.com",
  "password": "SecurePass@1"
}
```

---

## Security Notes

- Passwords are hashed using **PBKDF2-SHA256** with 260,000 iterations and a random per-user salt.
- For production, replace SQLite with **PostgreSQL** or **MySQL**.
- Add **JWT / session tokens** for authenticated routes.
- Enable **HTTPS** before deployment.
- Implement **rate limiting** on auth endpoints.

---

## Brand

**iSteer** — *Where precision meets premium.*  
Color palette: `#0a0a0a` (black) · `#c9a84c` (gold) · `#f5f2eb` (cream white)  
Typography: Playfair Display (headings) · DM Sans (body)

---

© 2025 iSteer Commerce. All rights reserved.