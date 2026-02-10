import os
from datetime import timedelta

class Config:
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your-secret-key-here'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    
    # Application configuration
    DEBUG = os.environ.get('FLASK_DEBUG') or True
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-123'
