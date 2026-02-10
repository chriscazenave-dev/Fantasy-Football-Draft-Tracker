from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import db, Group, User, user_groups

groups_bp = Blueprint('groups', __name__)

@groups_bp.route('', methods=['POST'])
@jwt_required()
def create_group():
    data = request.get_json()
    
    # Validate input
    if 'name' not in data:
        return jsonify({'error': 'Group name is required'}), 400
    
    # Get current user
    user_id = get_jwt_identity()
    
    # Create group
    group = Group(
        name=data['name'],
        description=data.get('description', ''),
        created_by=user_id
    )
    
    # Add creator as member
    user = User.query.get(user_id)
    group.members.append(user)
    
    db.session.add(group)
    db.session.commit()
    
    return jsonify({
        'message': 'Group created successfully',
        'group': group.to_dict()
    }), 201

@groups_bp.route('', methods=['GET'])
@jwt_required()
def get_user_groups():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify([group.to_dict() for group in user.groups]), 200

@groups_bp.route('/<int:group_id>', methods=['GET'])
@jwt_required()
def get_group(group_id):
    group = Group.query.get_or_404(group_id)
    
    # Check if user is a member of the group
    user_id = get_jwt_identity()
    if not any(member.id == user_id for member in group.members):
        return jsonify({'error': 'Not authorized to view this group'}), 403
    
    # Get detailed group info
    group_data = group.to_dict()
    group_data['members'] = [member.to_dict() for member in group.members]
    
    return jsonify(group_data), 200

@groups_bp.route('/<int:group_id>/members', methods=['POST'])
@jwt_required()
def add_member(group_id):
    data = request.get_json()
    
    if 'user_id' not in data:
        return jsonify({'error': 'User ID is required'}), 400
    
    group = Group.query.get_or_404(group_id)
    user_id = get_jwt_identity()
    
    # Check if current user is a member of the group
    if not any(member.id == user_id for member in group.members):
        return jsonify({'error': 'Not authorized to add members to this group'}), 403
    
    # Check if user to add exists
    user_to_add = User.query.get(data['user_id'])
    if not user_to_add:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if user is already in the group
    if any(member.id == user_to_add.id for member in group.members):
        return jsonify({'error': 'User is already a member of this group'}), 400
    
    # Add user to group
    group.members.append(user_to_add)
    db.session.commit()
    
    return jsonify({
        'message': 'User added to group successfully',
        'group': group.to_dict()
    }), 200
