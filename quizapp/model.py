from .database import db
from flask_security import UserMixin, RoleMixin
from datetime import datetime, timezone, timedelta

# Timezone setup
IST = timezone(timedelta(hours=5, minutes=30))
def utc_now():
    return datetime.now(IST)

# ----------------------
# User & Roles
# ----------------------
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    username = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    fs_uniquifier = db.Column(db.String, unique=True, nullable=False)
    active = db.Column(db.Boolean, nullable=False)

    # Relationships
    roles = db.relationship('Role', backref='bearer', secondary='user_roles')
    scores = db.relationship('Scores', backref='user', lazy=True, cascade='all, delete-orphan')
    answers = db.relationship('UserAnswer', backref='user', lazy=True, cascade='all, delete-orphan')

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)

class UserRoles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

# ----------------------
# Subject → Chapter → Question
# ----------------------
class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)

    chapters = db.relationship('Chapter', backref='subject', lazy=True, cascade='all, delete-orphan')

class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'))

    questions = db.relationship('Question', backref='chapter', lazy=True, cascade='all, delete-orphan')

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chap_id = db.Column(db.Integer, db.ForeignKey('chapter.id'))
    ques_statement = db.Column(db.String, nullable=False)
    option1 = db.Column(db.String, nullable=False)
    option2 = db.Column(db.String, nullable=False)
    option3 = db.Column(db.String, nullable=True)
    option4 = db.Column(db.String, nullable=True)
    correct_op = db.Column(db.Integer, nullable=False)

# ----------------------
# Quiz & Linking
# ----------------------
class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_name = db.Column(db.String, unique=True, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=utc_now)
    time_duration = db.Column(db.Integer, nullable=False)  # in minutes

    scores = db.relationship('Scores', backref='quiz', lazy=True, cascade='all, delete-orphan')
    answers = db.relationship('UserAnswer', backref='quiz', lazy=True, cascade='all, delete-orphan')
    questions = db.relationship('QuizQuestion', backref='quiz', lazy=True, cascade='all, delete-orphan')

class QuizQuestion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)

    question = db.relationship('Question')

# ----------------------
# Score & Answers
# ----------------------
class Scores(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'))
    score = db.Column(db.Integer, nullable=False, default=0)
    time_stamp = db.Column(db.DateTime, nullable=False, default=utc_now)

class UserAnswer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'))
    ques_id = db.Column(db.Integer, db.ForeignKey('question.id'))
    selected_op = db.Column(db.String, nullable=False, default='0')
    correct_op = db.Column(db.Integer, nullable=False)

    question = db.relationship('Question')
