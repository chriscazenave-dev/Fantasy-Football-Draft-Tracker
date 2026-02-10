import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import db, Group, User


class TestCreateGroup:
    """Tests for group creation endpoint."""
    
    def test_create_group_success(self, client, auth_headers):
        """Test successful group creation."""
        response = client.post('/api/groups', json={
            'name': 'New Group',
            'description': 'A new test group'
        }, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['message'] == 'Group created successfully'
        assert data['group']['name'] == 'New Group'
        assert data['group']['description'] == 'A new test group'
    
    def test_create_group_no_description(self, client, auth_headers):
        """Test group creation without description."""
        response = client.post('/api/groups', json={
            'name': 'Group Without Description'
        }, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['group']['name'] == 'Group Without Description'
    
    def test_create_group_missing_name(self, client, auth_headers):
        """Test group creation without name."""
        response = client.post('/api/groups', json={
            'description': 'No name provided'
        }, headers=auth_headers)
        
        assert response.status_code == 400
        assert 'Group name is required' in response.get_json()['error']
    
    def test_create_group_no_auth(self, client):
        """Test group creation without authentication."""
        response = client.post('/api/groups', json={
            'name': 'Unauthorized Group'
        })
        
        assert response.status_code == 401


class TestGetUserGroups:
    """Tests for getting user's groups endpoint."""
    
    def test_get_user_groups_success(self, client, auth_headers, sample_group):
        """Test getting user's groups."""
        response = client.get('/api/groups', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]['name'] == sample_group['name']
    
    def test_get_user_groups_empty(self, client, auth_headers):
        """Test getting groups when user has none."""
        response = client.get('/api/groups', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) == 0
    
    def test_get_user_groups_no_auth(self, client):
        """Test getting groups without authentication."""
        response = client.get('/api/groups')
        
        assert response.status_code == 401


class TestGetGroup:
    """Tests for getting a specific group endpoint."""
    
    def test_get_group_success(self, client, auth_headers, sample_group):
        """Test getting a specific group."""
        response = client.get(f'/api/groups/{sample_group["id"]}', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['name'] == sample_group['name']
        assert 'members' in data
    
    def test_get_group_not_found(self, client, auth_headers):
        """Test getting a non-existent group."""
        response = client.get('/api/groups/9999', headers=auth_headers)
        
        assert response.status_code == 404
    
    def test_get_group_not_member(self, app, client, sample_group, second_user):
        """Test getting a group when not a member."""
        with app.app_context():
            # Login as second user who is not a member
            login_response = client.post('/api/auth/login', json={
                'email': second_user['email'],
                'password': 'password456'
            })
            token = login_response.get_json()['access_token']
            headers = {'Authorization': f'Bearer {token}'}
            
            response = client.get(f'/api/groups/{sample_group["id"]}', headers=headers)
            
            assert response.status_code == 403
            assert 'Not authorized' in response.get_json()['error']


class TestAddMember:
    """Tests for adding members to a group endpoint."""
    
    def test_add_member_success(self, app, client, auth_headers, sample_group, second_user):
        """Test successfully adding a member to a group."""
        response = client.post(
            f'/api/groups/{sample_group["id"]}/members',
            json={'user_id': second_user['id']},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['message'] == 'User added to group successfully'
    
    def test_add_member_missing_user_id(self, client, auth_headers, sample_group):
        """Test adding member without user_id."""
        response = client.post(
            f'/api/groups/{sample_group["id"]}/members',
            json={},
            headers=auth_headers
        )
        
        assert response.status_code == 400
        assert 'User ID is required' in response.get_json()['error']
    
    def test_add_member_user_not_found(self, client, auth_headers, sample_group):
        """Test adding a non-existent user."""
        response = client.post(
            f'/api/groups/{sample_group["id"]}/members',
            json={'user_id': 9999},
            headers=auth_headers
        )
        
        assert response.status_code == 404
        assert 'User not found' in response.get_json()['error']
    
    def test_add_member_already_member(self, client, auth_headers, sample_group, sample_user):
        """Test adding a user who is already a member."""
        response = client.post(
            f'/api/groups/{sample_group["id"]}/members',
            json={'user_id': sample_user['id']},
            headers=auth_headers
        )
        
        assert response.status_code == 400
        assert 'already a member' in response.get_json()['error']
    
    def test_add_member_not_authorized(self, app, client, sample_group, second_user):
        """Test adding member when not authorized."""
        with app.app_context():
            # Login as second user who is not a member
            login_response = client.post('/api/auth/login', json={
                'email': second_user['email'],
                'password': 'password456'
            })
            token = login_response.get_json()['access_token']
            headers = {'Authorization': f'Bearer {token}'}
            
            response = client.post(
                f'/api/groups/{sample_group["id"]}/members',
                json={'user_id': second_user['id']},
                headers=headers
            )
            
            assert response.status_code == 403
            assert 'Not authorized' in response.get_json()['error']
