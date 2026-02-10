import pytest
import sys
import os

# Add the backend directory to the path so imports work correctly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import using the package structure (backend as the root)
from __init__ import create_app
from models import db, User, Group, Expense, ExpenseSplit
from config import Config


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    JWT_SECRET_KEY = 'test-jwt-secret-key'
    SECRET_KEY = 'test-secret-key'


@pytest.fixture
def app():
    """Create application for testing."""
    app = create_app(TestConfig)
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Create test CLI runner."""
    return app.test_cli_runner()


@pytest.fixture
def sample_user(app):
    """Create a sample user for testing."""
    with app.app_context():
        user = User(username='testuser', email='test@example.com')
        user.set_password('password123')
        db.session.add(user)
        db.session.commit()
        
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
        return user_data


@pytest.fixture
def auth_headers(client, sample_user):
    """Get authentication headers for a sample user."""
    response = client.post('/api/auth/login', json={
        'email': sample_user['email'],
        'password': 'password123'
    })
    token = response.get_json()['access_token']
    return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def second_user(app):
    """Create a second user for testing."""
    with app.app_context():
        user = User(username='seconduser', email='second@example.com')
        user.set_password('password456')
        db.session.add(user)
        db.session.commit()
        
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
        return user_data


@pytest.fixture
def sample_group(app, sample_user):
    """Create a sample group for testing."""
    with app.app_context():
        user = User.query.get(sample_user['id'])
        group = Group(
            name='Test Group',
            description='A test group',
            created_by=user.id
        )
        group.members.append(user)
        db.session.add(group)
        db.session.commit()
        
        group_data = {
            'id': group.id,
            'name': group.name,
            'description': group.description,
            'created_by': group.created_by
        }
        return group_data
