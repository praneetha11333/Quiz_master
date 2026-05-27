class config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS=True
    
class LocalDevelopmentConfig(config):
    #database
    SQLALCHEMY_DATABASE_URI = "sqlite:///quiz.sqlite3"
    DEBUG=True
    #security
    SECRET_KEY="this-is-key"
    SECURITY_PASSWORD_HASH="bcrypt"
    SECURITY_PASSWORD_SALT="this-is-salt"
    WTF_CSRF_ENABLED=False
    SECURITY_TOKEN_AUTHENTICATION_HEADER="Authentication-Token"
    