from celery import shared_task
from .model import Scores
import datetime
import csv
from .utils import format_report
from .model import User
from .mail import send_email
import requests



@shared_task(ignore_result=False,name="downloadcsvreport")

def download_csv_report():
    scores=Scores.query.all()
    csvfilename=f"scores_{datetime.datetime.now().strftime('%f')}.csv"
    with open(f'static/{csvfilename}', 'w',newline="") as csvfile:
        sr_no=1
        scorecsv=csv.writer(csvfile,delimiter=',')
        scorecsv.writerow(['Sr_No','User','Quiz_id','Score','Date'])
        for s in scores:
            sc=[sr_no,s.user.username,s.quiz_id,s.score,s.time_stamp.strftime('%Y-%m-%d')]
            scorecsv.writerow(sc)
            sr_no+=1
    return csvfilename

@shared_task(ignore_result=False,name="monthlyreport")
def monthlyreport():
    #user see there score taken qiz etc
    user=User.query.all()
    for u in user:
        user_data={
            "username": u.username,
            "email": u.email,
        }
        user_score=[]
        for s in u.scores:
            this_score={
                "quiz_id": s.quiz_id,
                "quiz_name": s.quiz.quiz_name,
                "score": s.score,
                "date": s.time_stamp.strftime('%Y-%m-%d')
            }
            user_score.append(this_score)
        user_data["scores"] = user_score
        message = format_report('templates/mail_details.html', user_data)
        send_email(u.email, subject = "Monthly transaction Report -Quiz", message = message)
    return "Monthly reports sent"


@shared_task(ignore_results=False, name="delivery_update")
def delivery_report(quiz_title):
    text = f"A new quiz titled '{quiz_title}' has been created! Please check the app at http://127.0.0.1:5000 . Available only for 3 hrs from now."
    response = requests.post(
        "https://chat.googleapis.com/v1/spaces/AAQAvtGkCn0/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=TdoHEsQRUgwi-mRi_qAR-o8xKsJmsTyqG0octN7vKV4",
        json={"text": text}
    )
    print(response.status_code)
    return "Quiz creation alert sent"



#sudo systemctl stop redis
#sudo systemctl disable redis
#celery -A app.celery worker --loglevel=info
#celery -A app.celery beat --loglevel=info
#sudo lsof -i :6379
#ps -fp 26212
# sudo kill -9 26212
#wsl --shutdown
