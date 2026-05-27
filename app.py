from flask import Flask
from quizapp.database import db
from quizapp.model import User,Role
from quizapp.resources import api
from quizapp.config import LocalDevelopmentConfig
from flask_security import Security,SQLAlchemyUserDatastore
from werkzeug.security import generate_password_hash
from quizapp.celery_init import celery_init_app
from celery.schedules import crontab
from quizapp.task import monthlyreport
from quizapp.cache_init import cache


def Create_app():
    app=Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    datastore = SQLAlchemyUserDatastore(db,User,Role)
    app.security=Security(app,datastore)
    app.app_context().push()
    return app

app=Create_app()
celery= celery_init_app(app)
celery.autodiscover_tasks()

cache.init_app(app
, config={
    'CACHE_TYPE': 'RedisCache',
    'CACHE_DEFAULT_TIMEOUT': 300,
}
    )


with app.app_context():
    db.create_all()
    app.security.datastore.find_or_create_role(name='Admin')
    app.security.datastore.find_or_create_role(name='User')
    db.session.commit()
    
    if not app.security.datastore.find_user(email="user@admin.com"):
        app.security.datastore.create_user(email="user@admin.com",
                                           username='Admin',
                                           password=generate_password_hash("333"),
                                           roles=['Admin'])
    if not app.security.datastore.find_user(email="praneetha@project.com"):
        app.security.datastore.create_user(email="praneetha@project.com",
                                           username='Praneetha',
                                           password=generate_password_hash("333"),
                                           roles=['User'])
    if not app.security.datastore.find_user(email="taylor@hector.com"):
        app.security.datastore.create_user(email="taylor@hector.com",
                                           username='taylor',
                                           password=generate_password_hash("333"),
                                           roles=['User'])
    
    db.session.commit()  
    
from quizapp.routes import *
@celery.on_after_finalize.connect 
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(minute = '*/3'),
        monthlyreport.s(),
    )

if __name__ =="__main__":
    app.run()