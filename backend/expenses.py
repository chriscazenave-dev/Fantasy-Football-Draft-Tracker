from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from .models import db, Expense, ExpenseSplit, User, Group

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route('', methods=['POST'])
@jwt_required()
def create_expense():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['description', 'amount', 'date', 'splits']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Validate amount
    try:
        amount = float(data['amount'])
        if amount <= 0:
            raise ValueError('Amount must be positive')
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid amount'}), 400
    
    # Validate date
    try:
        expense_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    # Get current user
    user_id = get_jwt_identity()
    
    # Create expense
    expense = Expense(
        description=data['description'],
        amount=amount,
        date=expense_date,
        payer_id=user_id,
        group_id=data.get('group_id')
    )
    
    # Add expense splits
    total_split = 0
    for split in data['splits']:
        if 'user_id' not in split or 'amount' not in split:
            return jsonify({'error': 'Invalid split data'}), 400
        
        split_amount = float(split['amount'])
        if split_amount <= 0:
            return jsonify({'error': 'Split amount must be positive'}), 400
        
        # Check if user exists
        if not User.query.get(split['user_id']):
            return jsonify({'error': f"User {split['user_id']} not found"}), 404
        
        expense.splits.append(ExpenseSplit(
            user_id=split['user_id'],
            amount=split_amount
        ))
        total_split += split_amount
    
    # Verify that the total split equals the expense amount
    if abs(total_split - amount) > 0.01:  # Allow for floating point imprecision
        return jsonify({'error': 'Sum of splits must equal the total amount'}), 400
    
    db.session.add(expense)
    db.session.commit()
    
    return jsonify({
        'message': 'Expense created successfully',
        'expense': expense.to_dict()
    }), 201

@expenses_bp.route('', methods=['GET'])
@jwt_required()
def get_expenses():
    user_id = get_jwt_identity()
    group_id = request.args.get('group_id')
    
    # Build base query
    query = Expense.query.join(Expense.splits).filter(
        (Expense.payer_id == user_id) | 
        (ExpenseSplit.user_id == user_id)
    )
    
    # Filter by group if specified
    if group_id:
        query = query.filter(Expense.group_id == group_id)
    
    # Get expenses
    expenses = query.distinct().all()
    
    return jsonify([expense.to_dict() for expense in expenses]), 200

@expenses_bp.route('/balances', methods=['GET'])
@jwt_required()
def get_balances():
    user_id = get_jwt_identity()
    group_id = request.args.get('group_id')
    
    # Get all users in the group (or all users if no group specified)
    if group_id:
        group = Group.query.get_or_404(group_id)
        if not any(member.id == user_id for member in group.members):
            return jsonify({'error': 'Not authorized to view this group'}), 403
        users = group.members
    else:
        users = User.query.all()
    
    # Calculate balances
    balances = {}
    for user in users:
        # Amount user paid
        paid = db.session.query(
            db.func.coalesce(db.func.sum(Expense.amount), 0)
        ).filter(
            Expense.payer_id == user.id
        )
        if group_id:
            paid = paid.filter(Expense.group_id == group_id)
        paid = paid.scalar() or 0
        
        # Amount user owes
        owed = db.session.query(
            db.func.coalesce(db.func.sum(ExpenseSplit.amount), 0)
        ).join(Expense).filter(
            ExpenseSplit.user_id == user.id,
            ExpenseSplit.is_settled == False
        )
        if group_id:
            owed = owed.filter(Expense.group_id == group_id)
        owed = owed.scalar() or 0
        
        # Calculate net balance
        net_balance = paid - owed
        
        balances[user.id] = {
            'user': user.to_dict(),
            'paid': float(paid),
            'owed': float(owed),
            'net_balance': float(net_balance)
        }
    
    return jsonify(balances), 200

@expenses_bp.route('/settle', methods=['POST'])
@jwt_required()
def settle_expense():
    data = request.get_json()
    
    # Validate input
    if 'expense_id' not in data or 'user_id' not in data:
        return jsonify({'error': 'Expense ID and user ID are required'}), 400
    
    # Get the expense split
    split = ExpenseSplit.query.filter_by(
        expense_id=data['expense_id'],
        user_id=data['user_id']
    ).first()
    
    if not split:
        return jsonify({'error': 'Expense split not found'}), 404
    
    # Check if the current user is the payer
    if split.expense.payer_id != get_jwt_identity():
        return jsonify({'error': 'Not authorized to settle this expense'}), 403
    
    # Mark as settled
    split.is_settled = True
    split.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Expense settled successfully',
        'expense': split.expense.to_dict()
    }), 200
