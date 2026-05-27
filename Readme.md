# QuizMaster

QuizMaster is a web-based quiz application built with Flask and Vue 3. Admins can create subjects, chapters, questions and quizzes. Users can take timed quizzes, view scores, and track performance.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12, Flask, Flask-RESTful |
| Auth | Flask-Security-Too (token-based) |
| Database | SQLite, SQLAlchemy ORM |
| Cache | Redis via Flask-Caching |
| Background Jobs | Celery + Celery Beat |
| Message Broker | Redis (`localhost:6379`) |
| Frontend | Vue 3, Vue Router, Bootstrap 5 |
| Timezone | IST (Asia/Kolkata) |

## 📁 Project Structure

```
Quiz_master/
├── app.py               # App factory, default users, Celery setup
├── celery_config.py     # Celery broker/backend config
├── req.txt              # Python dependencies
├── quizapp/
│   ├── model.py         # SQLAlchemy models
│   ├── routes.py        # Flask routes (login, register, scores)
│   ├── resources.py     # Flask-RESTful API resources
│   ├── config.py        # App configuration
│   ├── task.py          # Celery tasks
│   ├── mail.py          # Email via SMTP
│   ├── cache_init.py    # Flask-Cache init
│   ├── celery_init.py   # Celery init
│   └── utils.py         # Jinja2 report formatter
├── static/              # Vue 3 frontend
└── templates/           # index.html + email template
```

## 🗃️ Data Models

```
Subject → Chapter → Question
Quiz ←→ QuizQuestion ←→ Question
User → Scores → Quiz
User → UserAnswer → Question
```

## 📦 Installation

```bash
git clone https://github.com/praneetha-stud/your-project.git
cd Quiz_master

python3 -m venv venv
source venv/bin/activate       # macOS/Linux
venv\Scripts\activate          # Windows

pip install setuptools         # required first on Python 3.12
pip install -r req.txt
```

> `setuptools` must be installed before `req.txt` on Python 3.12 due to passlib dependency

## 🚀 Running the App

Start each in a **separate terminal** in this order:

**1. Redis**
```bash
redis-server
```

**2. Flask App**
```bash
python app.py
```
Runs at: http://127.0.0.1:5000

**3. Celery Worker**
```bash
# macOS/Linux
celery -A app.celery worker --loglevel=info

# Windows (WSL)
celery -A app.celery worker --loglevel=info --pool=solo
```

**4. Celery Beat** (monthly report every 3 minutes)
```bash
celery -A app.celery beat --loglevel=info
```

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/login` | Login, returns auth token |
| POST | `/api/register` | Register new user |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET/POST/DELETE | `/api/subject` | Manage subjects |
| POST/PATCH/DELETE | `/api/chapter` | Manage chapters |
| GET/POST/PATCH/DELETE | `/api/question` | Manage questions |
| GET/POST/PATCH/DELETE | `/api/quiz` | Manage quizzes |
| GET | `/api/quiz-attempts` | Quiz attempt stats (chart data) |
| GET | `/api/export` | Trigger CSV export (async) |
| GET | `/api/csv/<task_id>` | Download exported CSV |

### User
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/userhome` | Get current user info |
| GET | `/api/quiz` | List all quizzes |
| GET | `/api/quizquestion/<quiz_id>` | Get questions for a quiz |
| POST | `/api/submitanswer` | Submit quiz answers |
| POST | `/api/savescores` | Save quiz score |
| GET | `/api/showscore` | List all scores |
| GET | `/api/getscore?id=<quiz_id>` | Get detailed score for a quiz |
| GET | `/api/usersummary` | Score summary (chart data) |

## ⚙️ Background Tasks (Celery)

| Task | Trigger | Description |
|---|---|---|
| `monthlyreport` | Every 3 minutes | Sends score report email to all users |
| `downloadcsvreport` | On demand (admin) | Generates scores CSV file |
| `delivery_update` | On quiz creation | Sends Google Chat alert |

## 📧 Email Setup (Optional)

Emails are sent via SMTP on `localhost:1025`. Run a local SMTP server for testing:

```bash
# Option 1 — Python built-in
python -m smtpd -n -c DebuggingServer localhost:1025

# Option 2 — Docker (MailHog)
docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

View emails at: http://localhost:8025


## ⚠️ Notes

- `setuptools` must be installed before `req.txt` on Python 3.12
