import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import User


class TestAuthRegister:
    """Tests for user registration endpoint."""
    
    def test_register_success(self, client):
        """Test successful user registration."""
        response = client.post('/api/auth/register', json={
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'securepassword'
        })
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['message'] == 'User registered successfully'
        assert data['user']['username'] == 'newuser'
        assert data['user']['email'] == 'newuser@example.com'
        assert 'access_token' in data
    
    def test_register_missing_fields(self, client):
        """Test registration with missing required fields."""
        response = client.post('/api/auth/register', json={
            'username': 'newuser'
        })
        
        assert response.status_code == 400
        assert 'Missing required fields' in response.get_json()['error']
    
    def test_register_duplicate_username(self, client, sample_user):
        """Test registration with existing username."""
        response = client.post('/api/auth/register', json={
            'username': sample_user['username'],
            'email': 'different@example.com',
            'password': 'password123'
        })
        
        assert response.status_code == 400
        assert 'Username already exists' in response.get_json()['error']
    
    def test_register_duplicate_email(self, client, sample_user):
        """Test registration with existing email."""
        response = client.post('/api/auth/register', json={
            'username': 'differentuser',
            'email': sample_user['email'],
            'password': 'password123'
        })
        
        assert response.status_code == 400
        assert 'Email already registered' in response.get_json()['error']


class TestAuthLogin:
    """Tests for user login endpoint."""
    
    def test_login_success(self, client, sample_user):
        """Test successful login."""
        response = client.post('/api/auth/login', json={
            'email': sample_user['email'],
            'password': 'password123'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['message'] == 'Logged in successfully'
        assert data['user']['email'] == sample_user['email']
        assert 'access_token' in data
    
    def test_login_missing_fields(self, client):
        """Test login with missing fields."""
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com'
        })
        
        assert response.status_code == 400
        assert 'Missing email or password' in response.get_json()['error']
    
    def test_login_invalid_email(self, client):
        """Test login with non-existent email."""
        response = client.post('/api/auth/login', json={
            'email': 'nonexistent@example.com',
            'password': 'password123'
        })
        
        assert response.status_code == 401
        assert 'Invalid credentials' in response.get_json()['error']
    
    def test_login_wrong_password(self, client, sample_user):
        """Test login with wrong password."""
        response = client.post('/api/auth/login', json={
            'email': sample_user['email'],
            'password': 'wrongpassword'
        })
        
        assert response.status_code == 401
        assert 'Invalid credentials' in response.get_json()['error']


class TestAuthMe:
    """Tests for current user profile endpoint."""
    
    def test_get_current_user_success(self, client, sample_user, auth_headers):
        """Test getting current user profile."""
        response = client.get('/api/auth/me', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['username'] == sample_user['username']
        assert data['email'] == sample_user['email']
    
    def test_get_current_user_no_auth(self, client):
        """Test getting current user without authentication."""
        response = client.get('/api/auth/me')
        
        assert response.status_code == 401
    
    def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token."""
        response = client.get('/api/auth/me', headers={
            'Authorization': 'Bearer invalid-token'
        })
        
        assert response.status_code == 422
