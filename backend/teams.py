from flask import Blueprint, request, jsonify
from .models import db, Team
from datetime import datetime

teams_bp = Blueprint('teams', __name__)

@teams_bp.route('', methods=['GET'])
def get_teams():
    league_id = request.args.get('league_id', type=int)
    
    if league_id:
        teams = Team.query.filter_by(league_id=league_id).order_by(Team.draft_order).all()
    else:
        teams = Team.query.all()
    
    include_roster = request.args.get('include_roster', 'false').lower() == 'true'
    return jsonify([team.to_dict(include_roster=include_roster) for team in teams]), 200

@teams_bp.route('/<int:team_id>', methods=['GET'])
def get_team(team_id):
    team = Team.query.get_or_404(team_id)
    include_roster = request.args.get('include_roster', 'false').lower() == 'true'
    return jsonify(team.to_dict(include_roster=include_roster)), 200

@teams_bp.route('/<int:team_id>', methods=['PUT'])
def update_team(team_id):
    team = Team.query.get_or_404(team_id)
    data = request.get_json()
    
    if 'name' in data:
        team.name = data['name']
    if 'icon' in data:
        team.icon = data['icon']
    if 'color' in data:
        team.color = data['color']
    if 'bg_color' in data:
        team.bg_color = data['bg_color']
    if 'draft_order' in data:
        team.draft_order = data['draft_order']
    
    team.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(team.to_dict()), 200

@teams_bp.route('/<int:team_id>', methods=['DELETE'])
def delete_team(team_id):
    team = Team.query.get_or_404(team_id)
    db.session.delete(team)
    db.session.commit()
    return jsonify({'message': 'Team deleted successfully'}), 200

@teams_bp.route('/<int:team_id>/roster', methods=['GET'])
def get_team_roster(team_id):
    team = Team.query.get_or_404(team_id)
    roster = [prospect.to_dict() for prospect in team.drafted_prospects]
    return jsonify(roster), 200
