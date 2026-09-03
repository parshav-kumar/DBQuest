# DBQuest — Setup and Installation Guide

**DBQuest** is a game-based learning platform for database education (SQL, ER diagrams, normalisation, and functional dependencies), built with a React frontend and a Python FastAPI backend with a PostgreSQL database.

This guide explains how to install and run DBQuest on your own machine. No prior setup is assumed. Please follow the steps in order.

---

## 1. What you need to install first

Before running DBQuest, please install the following three tools if you do not already have them:

1. **Python** (version 3.11 or newer) — https://www.python.org/downloads/
2. **Node.js** (version 18 or newer, includes npm) — https://nodejs.org/
3. **PostgreSQL** (version 14 or newer) — https://www.postgresql.org/download/

To confirm each is installed, open a terminal and run:

```bash
python3 --version
node --version
npm --version
psql --version
```

Each command should print a version number.

---

## 2. Get the project files

The project has two main folders:

- `backend` — the FastAPI server
- `frontend` — the React application

Place the whole project folder somewhere convenient (for example, your Desktop).

---

## 3. Create the database

DBQuest uses a PostgreSQL database. You only need to create an **empty** database — the application creates all the tables automatically the first time it runs.

Open a terminal and run:

```bash
psql -U postgres
```

Then, at the `postgres=#` prompt, create the database and exit:

```sql
CREATE DATABASE dbquest;
\q
```

> **Note:** You can use any PostgreSQL username you like. Remember the username and password you use — you will need them in Step 5.

---

## 4. Get a free Groq API key (for the AI features)

DBQuest's AI features (the DBBot chatbot, hints, and explanations) are powered by the Groq API. You will need a free key:

1. Go to **https://console.groq.com/**
2. Sign up for a free account (this takes about two minutes).
3. Once logged in, open the **API Keys** section and click **Create API Key**.
4. Copy the key and keep it safe — you will paste it into the settings file in the next step.

> The free tier is sufficient for running and testing the application.

---

## 5. Set up the backend

**Step 5.1 — Open a terminal in the `backend` folder:**

```bash
cd path/to/DBQuest/backend
```

(Replace `path/to/DBQuest` with the actual location, e.g. `~/Desktop/DBQuest`.)

**Step 5.2 — Create and activate a Python virtual environment:**

On macOS / Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

On Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

**Step 5.3 — Install the required Python packages:**

```bash
pip install -r requirements.txt
```

**Step 5.4 — Create the settings file.**

In the `backend` folder, create a new file named exactly `.env` and paste in the following, filling in your own database details and Groq key:

```
DATABASE_URL=postgresql://YOUR_DB_USERNAME:YOUR_DB_PASSWORD@localhost:5432/dbquest
SECRET_KEY=dbquest-super-secret-key-2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GROQ_API_KEY=YOUR_GROQ_KEY_HERE
```

- Replace `YOUR_DB_USERNAME` and `YOUR_DB_PASSWORD` with the PostgreSQL username and password from Step 3.
- Replace `YOUR_GROQ_KEY_HERE` with the Groq key from Step 4.
- Leave the other three lines exactly as they are.

**Step 5.5 — Start the backend:**

```bash
uvicorn main:app --reload
```

The first time it runs, it will automatically create all the database tables. When you see the message **"Application startup complete"**, the backend is running.

Leave this terminal window open and running.

---

## 6. Set up the frontend

**Step 6.1 — Open a NEW terminal window** (leave the backend running in the first one) and go to the `frontend` folder:

```bash
cd path/to/DBQuest/frontend
```

**Step 6.2 — Install the required packages:**

```bash
npm install
```

**Step 6.3 — Start the frontend:**

```bash
npm run dev
```

This will show a local web address, usually **http://localhost:5175**.

---

## 7. Open and use the application

1. Open your web browser and go to the address shown in Step 6.3 (e.g. **http://localhost:5175**).
2. Click **Register** and create an account.
3. Log in, and you can begin using DBQuest — take a pre-test, work through the quiz levels, view the dashboard, leaderboard, and try the DBBot chatbot.

> **Note:** The database starts empty, so the leaderboard will have no entries until accounts are created and quizzes are attempted. Registering an account and completing a quiz will populate it.

---

## 8. Summary of the running order

Once everything is installed, running DBQuest in future just takes two terminals:

**Terminal 1 — backend:**
```bash
cd path/to/DBQuest/backend
source venv/bin/activate        # (venv\Scripts\activate on Windows)
uvicorn main:app --reload
```

**Terminal 2 — frontend:**
```bash
cd path/to/DBQuest/frontend
npm run dev
```

Then open the browser address from Terminal 2.

---

## Troubleshooting

**The backend won't start / database error**
- Make sure PostgreSQL is running.
- Check that the `dbquest` database exists (Step 3).
- Check the username, password, and database name in your `.env` `DATABASE_URL` are correct.

**The AI features (DBBot, hints, explanations) don't respond**
- Make sure your `GROQ_API_KEY` in the `.env` file is correct and has no extra spaces.
- Confirm the key is active in your Groq account.

**The frontend loads but nothing works / login fails**
- Make sure the backend terminal is still running (Step 5.5) and shows no errors.

**"command not found" errors**
- This usually means the relevant tool (Python, Node, or PostgreSQL) is not installed or not on your system path. Revisit Step 1.
