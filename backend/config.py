import os

class Config:
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Application configuration
    DEBUG = os.environ.get('FLASK_DEBUG') or True
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-123'
