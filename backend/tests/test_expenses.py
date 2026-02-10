import pytest
import sys
import os
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import db, Expense, ExpenseSplit, User, Group


class TestCreateExpense:
    """Tests for expense creation endpoint."""
    
    def test_create_expense_success(self, app, client, auth_headers, sample_user, second_user):
        """Test successful expense creation."""
        response = client.post('/api/expenses', json={
            'description': 'Dinner',
            'amount': 100.00,
            'date': '2024-01-15',
            'splits': [
                {'user_id': sample_user['id'], 'amount': 50.00},
                {'user_id': second_user['id'], 'amount': 50.00}
            ]
        }, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['message'] == 'Expense created successfully'
        assert data['expense']['description'] == 'Dinner'
        assert data['expense']['amount'] == 100.00
        assert len(data['expense']['splits']) == 2
    
    def test_create_expense_with_group(self, app, client, auth_headers, sample_user, second_user, sample_group):
        """Test expense creation within a group."""
        # First add second user to group
        client.post(
            f'/api/groups/{sample_group["id"]}/members',
            json={'user_id': second_user['id']},
            headers=auth_headers
        )
        
        response = client.post('/api/expenses', json={
            'description': 'Group Lunch',
            'amount': 60.00,
            'date': '2024-01-15',
            'group_id': sample_group['id'],
            'splits': [
                {'user_id': sample_user['id'], 'amount': 30.00},
                {'user_id': second_user['id'], 'amount': 30.00}
            ]
        }, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['expense']['group_id'] == sample_group['id']
    
    def test_create_expense_missing_fields(self, client, auth_headers):
        """Test expense creation with missing required fields."""
        response = client.post('/api/expenses', json={
            'description': 'Incomplete Expense'
        }, headers=auth_headers)
        
        assert response.status_code == 400
        assert 'Missing required fields' in response.get_json()['error']
    
    def test_create_expense_invalid_amount(self, client, auth_headers, sample_user):
        """Test expense creation with invalid amount."""
        response = client.post('/api/expenses', json={
            'description': 'Invalid Amount',
            'amount': -50.00,
            'date': '2024-01-15',
            'splits': [{'user_id': sample_user['id'], 'amount': -50.00}]
        }, headers=auth_headers)
        
        assert response.status_code == 400
        assert 'Invalid amount' in response.get_json()['error']
    
    def test_create_expense_invalid_date(self, client, auth_headers, sample_user):
        """Test expense creation with invalid date format."""
        response = client.post('/api/expenses', json={
            'description': 'Invalid Date',
            'amount': 50.00,
            'date': 'not-a-date',
            'splits': [{'user_id': sample_user['id'], 'amount': 50.00}]
        }, headers=auth_headers)
        
        assert response.status_code == 400
        assert 'Invalid date format' in response.get_json()['error']
    
    def test_create_expense_splits_not_equal_amount(self, client, auth_headers, sample_user, second_user):
        """Test expense creation where splits don't equal total."""
        response = client.post('/api/expenses', json={
            'description': 'Mismatched Splits',
            'amount': 100.00,
            'date': '2024-01-15',
            'splits': [
                {'user_id': sample_user['id'], 'amount': 30.00},
                {'user_id': second_user['id'], 'amount': 30.00}
            ]
        }, headers=auth_headers)
        
        assert response.status_code == 400
        assert 'Sum of splits must equal' in response.get_json()['error']
    
    def test_create_expense_invalid_split_user(self, client, auth_headers, sample_user):
        """Test expense creation with non-existent user in splits."""
        response = client.post('/api/expenses', json={
            'description': 'Invalid User Split',
            'amount': 100.00,
            'date': '2024-01-15',
            'splits': [
                {'user_id': sample_user['id'], 'amount': 50.00},
                {'user_id': 9999, 'amount': 50.00}
            ]
        }, headers=auth_headers)
        
        assert response.status_code == 404
        assert 'not found' in response.get_json()['error']
    
    def test_create_expense_no_auth(self, client):
        """Test expense creation without authentication."""
        response = client.post('/api/expenses', json={
            'description': 'Unauthorized',
            'amount': 50.00,
            'date': '2024-01-15',
            'splits': []
        })
        
        assert response.status_code == 401


class TestGetExpenses:
    """Tests for getting expenses endpoint."""
    
    def test_get_expenses_success(self, app, client, auth_headers, sample_user, second_user):
        """Test getting user's expenses."""
        # Create an expense first
        client.post('/api/expenses', json={
            'description': 'Test Expense',
            'amount': 100.00,
            'date': '2024-01-15',
            'splits': [
                {'user_id': sample_user['id'], 'amount': 50.00},
                {'user_id': second_user['id'], 'amount': 50.00}
            ]
        }, headers=auth_headers)
        
        response = client.get('/api/expenses', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) >= 1
    
    def test_get_expenses_empty(self, client, auth_headers):
        """Test getting expenses when user has none."""
        response = client.get('/api/expenses', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) == 0
    
    def test_get_expenses_filter_by_group(self, app, client, auth_headers, sample_user, second_user, sample_group):
        """Test filtering expenses by group."""
        # Add second user to group
        client.post(
            f'/api/groups/{sample_group["id"]}/members',
            json={'user_id': second_user['id']},
            headers=auth_headers
        )
        
        # Create expense in group
        client.post('/api/expenses', json={
            'description': 'Group Expense',
            'amount': 100.00,
            'date': '2024-01-15',
            'group_id': sample_group['id'],
            'splits': [
                {'user_id': sample_user['id'], 'amount': 50.00},
                {'user_id': second_user['id'], 'amount': 50.00}
            ]
        }, headers=auth_headers)
        
        # Create expense without group
        client.post('/api/expenses', json={
            'description': 'Non-Group Expense',
            'amount': 50.00,
            'date': '2024-01-15',
            'splits': [{'user_id': sample_user['id'], 'amount': 50.00}]
        }, headers=auth_headers)
        
        response = client.get(f'/api/expenses?group_id={sample_group["id"]}', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert all(e['group_id'] == sample_group['id'] for e in data)
    
    def test_get_expenses_no_auth(self, client):
        """Test getting expenses without authentication."""
        response = client.get('/api/expenses')
        
        assert response.status_code == 401


class TestGetBalances:
    """Tests for getting balances endpoint."""
    
    def test_get_balances_success(self, app, client, auth_headers, sample_user, second_user):
        """Test getting balances."""
        # Create an expense
        client.post('/api/expenses', json={
            'description': 'Balance Test',
            'amount': 100.00,
            'date': '2024-01-15',
            'splits': [
                {'user_id': sample_user['id'], 'amount': 50.00},
                {'user_id': second_user['id'], 'amount': 50.00}
            ]
        }, headers=auth_headers)
        
        response = client.get('/api/expenses/balances', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, dict)
    
    def test_get_balances_by_group(self, app, client, auth_headers, sample_user, second_user, sample_group):
        """Test getting balances for a specific group."""
        # Add second user to group
        client.post(
            f'/api/groups/{sample_group["id"]}/members',
            json={'user_id': second_user['id']},
            headers=auth_headers
        )
        
        response = client.get(f'/api/expenses/balances?group_id={sample_group["id"]}', headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, dict)
    
    def test_get_balances_no_auth(self, client):
        """Test getting balances without authentication."""
        response = client.get('/api/expenses/balances')
        
        assert response.status_code == 401


class TestSettleExpense:
    """Tests for settling expenses endpoint."""
    
    def test_settle_expense_success(self, app, client, auth_headers, sample_user, second_user):
        """Test successfully settling an expense."""
        # Create an expense
        create_response = client.post('/api/expenses', json={
            'description': 'Settle Test',
            'amount': 100.00,
            'date': '2024-01-15',
            'splits': [
                {'user_id': sample_user['id'], 'amount': 50.00},
                {'user_id': second_user['id'], 'amount': 50.00}
            ]
        }, headers=auth_headers)
        
        expense_id = create_response.get_json()['expense']['id']
        
        # Settle the expense for second user
        response = client.post('/api/expenses/settle', json={
            'expense_id': expense_id,
            'user_id': second_user['id']
        }, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['message'] == 'Expense settled successfully'
    
    def test_settle_expense_missing_fields(self, client, auth_headers):
        """Test settling expense with missing fields."""
        response = client.post('/api/expenses/settle', json={
            'expense_id': 1
        }, headers=auth_headers)
        
        assert response.status_code == 400
        assert 'required' in response.get_json()['error']
    
    def test_settle_expense_not_found(self, client, auth_headers, sample_user):
        """Test settling a non-existent expense split."""
        response = client.post('/api/expenses/settle', json={
            'expense_id': 9999,
            'user_id': sample_user['id']
        }, headers=auth_headers)
        
        assert response.status_code == 404
        assert 'not found' in response.get_json()['error']
    
    def test_settle_expense_not_payer(self, app, client, auth_headers, sample_user, second_user):
        """Test settling expense when not the payer."""
        # Create an expense as sample_user
        create_response = client.post('/api/expenses', json={
            'description': 'Not Payer Test',
            'amount': 100.00,
            'date': '2024-01-15',
            'splits': [
                {'user_id': sample_user['id'], 'amount': 50.00},
                {'user_id': second_user['id'], 'amount': 50.00}
            ]
        }, headers=auth_headers)
        
        expense_id = create_response.get_json()['expense']['id']
        
        # Login as second user and try to settle
        login_response = client.post('/api/auth/login', json={
            'email': second_user['email'],
            'password': 'password456'
        })
        second_user_headers = {'Authorization': f'Bearer {login_response.get_json()["access_token"]}'}
        
        response = client.post('/api/expenses/settle', json={
            'expense_id': expense_id,
            'user_id': second_user['id']
        }, headers=second_user_headers)
        
        assert response.status_code == 403
        assert 'Not authorized' in response.get_json()['error']
    
    def test_settle_expense_no_auth(self, client):
        """Test settling expense without authentication."""
        response = client.post('/api/expenses/settle', json={
            'expense_id': 1,
            'user_id': 1
        })
        
        assert response.status_code == 401
