from flask_restful import Api, Resource, reqparse 
from .model import *
from flask_security import auth_required, roles_required, roles_accepted, current_user
from flask import jsonify
from .database import db
from quizapp.task import delivery_report

api = Api()

class SubjectApi(Resource):
    @auth_required('token')
    @roles_accepted('Admin', 'User')
    # get subject
    def get(self):
        subject=[]
        subjects=Subject.query.all()
        for sub in subjects:
            s_ub={}
            s_ub['id']=sub.id
            s_ub['name']=sub.name
            s_ub['chapters']=[{"id":chap.id,"name":chap.name}for chap in sub.chapters]
            subject.append(s_ub)
        if subject :
            return subject
        return {"message":"error occured"},201
    # post subject    
    @auth_required('token')
    @roles_required('Admin')        
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help="Subject name is required")
        data = parser.parse_args()

        if Subject.query.filter_by(name=data['name']).first():
            return {"message": "Subject already exists!"}, 400
        subject = Subject(name=data['name'])
        db.session.add(subject)
        db.session.commit()
        return {"message": "Subject created successfully!","sub_id":subject.id},201
       
     #Delete subject   
    @auth_required('token')
    @roles_required('Admin')
    def delete(self,id):
        sub=Subject.query.get(id)
        if sub:
            db.session.delete(sub)
            db.session.commit()
            return {"message":"sub deleted successfully!"},200
        return {"message":"subject does not exist!"},404
        


class chapterApi(Resource):
    #post
    @auth_required('token')
    @roles_required('Admin')
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help="Chapter name is required")
        parser.add_argument('subject_id', type=int, required=True, help="Subject id is required")
        data = parser.parse_args()
        
        subject=Subject.query.get(data['subject_id'])
        if not subject:
            return {"message": "Subject does not exist!"}, 404
        
        if Chapter.query.filter_by(name=data['name'],subject_id=data["subject_id"]).first():
            return {"message": "Chapter already exists!"}, 400
        
        chapter = Chapter(name=data['name'], subject_id=data['subject_id'])
        db.session.add(chapter)
        db.session.commit()
        return {"message": "Chapter created successfully!","chapter_id":chapter.id},201
       
        
    @auth_required('token')
    @roles_required('Admin')    
    def patch(self,id):
        parser = reqparse.RequestParser()
        parser.add_argument("name", type=str, required=False)
        data = parser.parse_args()

        chapter = Chapter.query.get(id)
        if not chapter:
            return {"message": "Chapter not found!"}, 404
        if data["name"]:
            chapter.name = data["name"]
        db.session.commit()
        return {"message": "Chapter updated successfully!"}, 200
    
    @auth_required('token')
    @roles_required('Admin')
    def delete(self,id):
        chapter=Chapter.query.get(id)
        if chapter:
            db.session.delete(chapter)
            db.session.commit()
            return {"message":"Chapter deleted successfully!"},200
        return {"message":"Chapter does not exist!"},404
    


class questionApi(Resource):
    qparser = reqparse.RequestParser()
    qparser.add_argument('chap_id', type=int, required=True, help="Chapter id is required")
    qparser.add_argument('ques_statement', type=str, required=True, help="Question statement is required")
    qparser.add_argument('option1', type=str, required=True, help="Option1 is required")
    qparser.add_argument('option2', type=str, required=True, help="Option2 is required")
    qparser.add_argument('option3', type=str, required=False)
    qparser.add_argument('option4', type=str, required=False)
    qparser.add_argument('correct_op', type=int, required=True, help="Correct option is required")
    
    @auth_required('token')
    @roles_accepted('Admin', 'User')
   
    def get(self,chap_id):
        question=[]
        ques=Question.query.filter_by(chap_id=chap_id).all()
        if not ques:
            return {"message": "Question not found!"}, 404
        for sub in ques:
            s_ub={}
            s_ub['id']=sub.id
            s_ub['chap_id']=sub.chap_id
            s_ub['name']=sub.ques_statement
            s_ub['options']=[sub.option1,sub.option2,sub.option3,sub.option4]
            s_ub['correct_op']=sub.correct_op
            question.append(s_ub)
        if question :
            return question
        return {"message":"error occured"},201
    
    
    @auth_required('token')
    @roles_required('Admin')
    def post(self):
        data = questionApi.qparser.parse_args()
        chapter=Chapter.query.get(data['chap_id'])
        if not chapter:
            return {"message": "Chapter does not exist!"}, 404
        
        
        question = Question(chap_id=data['chap_id'], ques_statement=data['ques_statement'], option1=data['option1'], option2=data['option2'], option3=data['option3'], option4=data['option4'], correct_op=data['correct_op'])
        db.session.add(question)
        db.session.commit()
        return {"message": "Question created successfully!","question_id":question.id},201
        
    
    #update question
    @auth_required('token')
    @roles_required('Admin')
    def patch(self,id):
        parser_copy=questionApi.qparser.copy()
        for arg in parser_copy.args:
            arg.required = False
        data = parser_copy.parse_args()
        question=Question.query.get(id)
        if not question:
            return {"message": "Question not found!"}, 404
        
        for key, value in data.items():
            if key == "id":
                continue
            if value is not None:
                setattr(question, key, value)
        db.session.commit()
        return {"message": "Question updated successfully!"},200
       
        
    @auth_required('token')
    @roles_required('Admin')
    def delete(self,id):
        question=Question.query.get(id)
        quizques=QuizQuestion.query.filter_by(question_id=id).first()
        if question:
            db.session.delete(question)
            if quizques:
                db.session.delete(quizques)
            db.session.commit()
            return {"message":"Question deleted successfully!"},200
        return {"message":"Question does not exist!"},404

class quizApi(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument('quiz_name', type=str, required=True, help="Quiz name is required", location='json')
    parser.add_argument('time_duration', type=int, required=True, help="Time duration is required", location='json')
    parser.add_argument('chapter_ids', type=list, location='json', required=True)
    
    
    @auth_required('token')
    @roles_accepted('Admin', 'User')
    
    def get(self, id=None):
        def extract_subject_name(quiz):
            for q in quiz.questions:
                question = q.question
                chapter = getattr(question, 'chapter', None)
                subject = getattr(chapter, 'subject', None)
                if subject:
                    return subject.name
            return "Unknown"

        def extract_chapters(quiz):
            seen_ids = set()
            chapters = []
            for q in quiz.questions:
                chapter = getattr(q.question, 'chapter', None)
                if chapter and chapter.id not in seen_ids:
                    chapters.append({"id": chapter.id, "name": chapter.name})
                    seen_ids.add(chapter.id)
            return chapters

        if id is None:
            quizzes = Quiz.query.all()
            if not quizzes:
                return {"message": "No quizzes found"}, 404

            quiz_list = []
            for quiz in quizzes:
                quiz_list.append({
                    "id": quiz.id,
                    "quiz_name": quiz.quiz_name,
                    "time_duration": quiz.time_duration,
                    "date": quiz.date.strftime('%Y-%m-%d %H:%M:%S'),
                    "subject": extract_subject_name(quiz),
                    "chapters": extract_chapters(quiz),
                    "total_questions": sum(1 for qq in quiz.questions if qq.question)
                })

            return quiz_list, 200

        quiz = Quiz.query.filter_by(id=id).first()
        if not quiz:
            return {"message": "Quiz not found"}, 404

        return {
            "id": quiz.id,
            "quiz_name": quiz.quiz_name,
            "time_duration": quiz.time_duration,
            "date": quiz.date.strftime('%Y-%m-%d %H:%M:%S'),
            "subject": extract_subject_name(quiz),
            "chapters": extract_chapters(quiz)
        }, 200


    @auth_required('token')
    @roles_required('Admin')
    def post(self):
        data = quizApi.parser.parse_args()

        
        quiz_name = data.get('quiz_name')
        time_duration = data.get('time_duration')
        chapter_ids = data.get('chapter_ids') 

        if Quiz.query.filter_by(quiz_name=quiz_name).first():
            return {"message": "Quiz already exists!"}, 400

        if not chapter_ids or not isinstance(chapter_ids, list):
            return {"message": "Please provide a list of chapter IDs"}, 400

        quiz = Quiz(quiz_name=quiz_name, time_duration=time_duration)
        db.session.add(quiz)
        db.session.flush()  # 
        for chap_id in chapter_ids:
            questions = Question.query.filter_by(chap_id=chap_id).all()
            for q in questions:
                quiz_question = QuizQuestion(quiz_id=quiz.id, question_id=q.id)
                db.session.add(quiz_question)
        db.session.commit()
        try:
            delivery_report.delay(quiz_name)
        except Exception:
            pass
        return {"message": "Quiz created and questions added successfully!", "quiz_id": quiz.id}, 201




        
    # patch method to update quiz
    @auth_required('token')
    @roles_required('Admin')
    def patch(self,id):
        parser_copy=quizApi.parser.copy()
        for arg in parser_copy.args:
            arg.required = False
        data = parser_copy.parse_args()
        quiz=Quiz.query.get(id)
        if not quiz:
            return {"message": "Quiz not found!"}, 404
    
        for key, value in data.items():
            if key == "id":
                continue
            if value is not None:
                setattr(quiz, key, value)
        db.session.commit()
        return {"message": "Quiz updated successfully!"},200
       
       
    @auth_required('token')
    @roles_required('Admin')
    
    def delete(self,id):
        quiz=Quiz.query.get(id)
        if quiz:
            db.session.delete(quiz)
            db.session.commit()
            return {"message":"Quiz deleted successfully!"},200
        return {"message":"Quiz does not exist!"},404
    
class quizquestionApi(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument('quiz_id', type=str, required=True, help="Quiz id required")
    parser.add_argument('question_id', type=int, required=True, help="Question id required")  
    
    @auth_required('token')
    @roles_accepted('Admin', 'User')
    def get(self,quiz_id):
        question=[]
        quiz=QuizQuestion.query.filter_by(quiz_id=quiz_id).all()
        if not quiz:
            return {"message": "Quiz not found!"}, 404
        for sub in quiz:
            s_ub={}
            s_ub['id']=sub.id
            s_ub['quiz_id']=sub.quiz_id
            s_ub['question_id']=sub.question.id
            s_ub['ques_statement']=sub.question.ques_statement
            s_ub['options']=[sub.question.option1,sub.question.option2,sub.question.option3,sub.question.option4]
            s_ub['correct_op']=sub.question.correct_op
            question.append(s_ub)
        if question :
            return question
        return {"message":"error occured"},201
   
  
    @auth_required('token')
    @roles_required('Admin')
    def post(self):
        data = quizquestionApi.parser.parse_args()
        if QuizQuestion.query.filter_by(quiz_id=data['quiz_id'], question_id=data['question_id']).first():
            return {"message": "This question is already added to the quiz."}, 400
        quizq = QuizQuestion(quiz_id=data['quiz_id'], question_id=data['question_id'])
        db.session.add(quizq)
        db.session.commit()
        return {"message": "Question added to quiz successfully!", "quiz_question_id": quizq.id}, 201
   

    
       

            
api.add_resource(SubjectApi, '/api/subject','/api/subject/<int:id>')
api.add_resource(chapterApi, '/api/chapter','/api/chapter/<int:id>')
api.add_resource(questionApi, '/api/question', '/api/question/<int:chap_id>', '/api/question/id/<int:id>')
api.add_resource(quizApi, '/api/quiz','/api/quiz/<int:id>','/api/quiz/id/<int:id>')
api.add_resource(quizquestionApi, '/api/quizquestion', '/api/quizquestion/<int:quiz_id>')
