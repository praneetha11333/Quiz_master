from .database import db
from .model import *
from flask import current_app as app,render_template,send_from_directory
from celery.result import AsyncResult
from flask_security import auth_required,roles_required,current_user,login_user
from  flask import jsonify,request
from werkzeug.security import check_password_hash, generate_password_hash
from .task import download_csv_report
from sqlalchemy import func
from quizapp.cache_init import cache

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/api/admin')
@auth_required('token')
@roles_required('Admin')
def a_home():
    
    return {
        "message": "Welcome Admin"
    }
    
    
@app.route('/api/userhome')
@auth_required('token')
@roles_required('User')

def user_home():
    user = current_user
    return jsonify({
        "username": user.username,
        "email": user.email,
        "password": user.password
    })
    
@app.route('/api/login', methods=['POST'])
def user_login():
    body = request.get_json()
    email = body['email']
    password = body['password']

    if not email:
        return jsonify({
            "message": "Email is required!"
        }), 400
    
    user = app.security.datastore.find_user(email = email)
    if user:
        if check_password_hash(user.password, password):
            login_user(user)
            return jsonify({
                "id": user.id,
                "username": user.username,
                "auth-token": user.get_auth_token()
            })
        else:
            return jsonify({
                "message": "Incorrect Password"
            }), 400
    else:
       return jsonify({
            "message": "User Not Found!"
        }), 404 

@app.post('/api/register')
def create_user():
    credentials = request.get_json()
    if not app.security.datastore.find_user(email = credentials["email"]):
        app.security.datastore.create_user(email = credentials["email"],
                                           username = credentials["username"],
                                           password = generate_password_hash(credentials["password"]),
                                           roles = ['User'])
        db.session.commit()
        return jsonify({
            "message": "User created successfully"
        }), 201
    
    return jsonify({
        "message": "User already exists!"
    }), 400
    

@app.route('/api/submitanswer', methods=['POST'])
@auth_required('token')
@roles_required('User')
def save_answer():
    data = request.get_json()
    user = current_user
    quiz_id = data['quiz_id']
    answers = data['answers']
    for ans in answers:
        question_id = ans['question_id']
        selected_option = ans['answer']
        existing_answer = UserAnswer.query.filter_by(user_id=user.id,quiz_id=quiz_id,ques_id=question_id).first()

        if existing_answer:
            existing_answer.selected_op = selected_option
            
        else:
            question = Question.query.get(question_id)
            correct_option = question.correct_op 
            new_answer = UserAnswer(user_id=user.id,quiz_id=quiz_id,ques_id=question_id,selected_op=selected_option,correct_op=correct_option)
            db.session.add(new_answer)

    db.session.commit()
    return jsonify({"message": "Answers submitted successfully"}), 200
       
        
@app.route('/api/savescores', methods=['POST'])
@auth_required('token')
@roles_required('User')
def save_scores():
    data = request.get_json()
    user = current_user
    quiz_id = data['quiz_id']
    score = data['score']
    existing_score = Scores.query.filter_by(
        user_id=user.id,
        quiz_id=quiz_id
    ).first()

    if existing_score:
        existing_score.score = score
    else:
        new_score = Scores(
            user_id=user.id,
            quiz_id=quiz_id,
            score=score,
            time_stamp=utc_now()
        )
        db.session.add(new_score)

    db.session.commit()
    return jsonify({"message": "Score saved successfully"}), 200

    
    

@app.route('/api/showscore', methods=['GET'])
@auth_required('token')
@roles_required('User')
def show_score():
    user = current_user
    scores = Scores.query.filter_by(user_id=user.id).all()

    result = []
    for s in scores:
        quiz = s.quiz
        questions = QuizQuestion.query.filter_by(quiz_id=quiz.id).all()
        subject = questions[0].question.chapter.subject.name if questions else None

        result.append({"quiz_id": quiz.id,"quiz_name": quiz.quiz_name,"subject": subject,"totalquestions": len(questions),"score": s.score})
    return jsonify(result)
   


@app.route('/api/getscore', methods=['GET'])

@auth_required('token')
@roles_required('User')
@cache.cached(timeout=300, key_prefix=lambda: f'user_score_{current_user.id}_{request.args.get("id")}')
def get_score():
        qid = request.args.get('id', type=int)
        user = current_user

        user_answers = UserAnswer.query.filter_by(user_id=user.id, quiz_id=qid).all()
        if not user_answers:
            return {"message": "No answers found for this quiz"}, 404

        # get all valid question ids for this quiz to ensure we only show correct questions
        valid_question_ids = {qq.question_id for qq in QuizQuestion.query.filter_by(quiz_id=qid).all()}

        questions_data = []
        for ua in user_answers:
            if ua.ques_id not in valid_question_ids:
                continue
            question = Question.query.get(ua.ques_id)
            if not question:
                continue
            questions_data.append({
                "statement": question.ques_statement,
                "option1": question.option1,
                "option2": question.option2,
                "option3": question.option3,
                "option4": question.option4,
                "selected_op": int(ua.selected_op) if ua.selected_op and ua.selected_op != '0' else None,
                "correct_op": question.correct_op
            })
        return {"questions": questions_data}, 200

   
    
@app.route('/api/export')
@auth_required('token')
@roles_required('Admin')
def export_csv():
    result=download_csv_report.delay()
    return jsonify({
        "id": result.id,
        "result":result.result,
    })
    
@app.route('/api/csv/<task_id>')

def csv(task_id):
    res=AsyncResult(task_id)
    return  send_from_directory('static', res.result)


@app.route('/api/quiz-attempts')
@cache.cached(timeout=300, key_prefix='admin_summary')
def quiz_attempts():
    results = (
        db.session.query(Quiz.quiz_name, func.count(Scores.id))
        .join(Scores, Quiz.id == Scores.quiz_id)
        .group_by(Quiz.quiz_name)
        .all()
    )
    return jsonify({
        "labels": [quiz_name for quiz_name, _ in results],
        "data": [count for _, count in results]
    })

@app.route('/api/usersummary')
@auth_required('token')
@roles_required('User')
@cache.cached(timeout=300, key_prefix='user_summary')
def user_summary():
    results = (
        db.session.query(Quiz.quiz_name, Scores.score)
        .join(Quiz, Scores.quiz_id == Quiz.id)
        .filter(Scores.user_id == current_user.id)
        .all()
    )
    return jsonify({
        "labels": [quiz_name for quiz_name, _ in results],
        "data": [score for _, score in results]
    })
