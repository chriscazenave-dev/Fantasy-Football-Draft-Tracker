from flask import Blueprint, request, jsonify
from .models import db, League, Team, Prospect, DraftPick
from datetime import datetime

leagues_bp = Blueprint('leagues', __name__)

@leagues_bp.route('', methods=['GET'])
def get_leagues():
    leagues = League.query.all()
    return jsonify([league.to_dict() for league in leagues]), 200

@leagues_bp.route('/<int:league_id>', methods=['GET'])
def get_league(league_id):
    league = League.query.get_or_404(league_id)
    include_relations = request.args.get('include_relations', 'false').lower() == 'true'
    return jsonify(league.to_dict(include_relations=include_relations)), 200

@leagues_bp.route('', methods=['POST'])
def create_league():
    data = request.get_json()
    
    if not data or 'name' not in data:
        return jsonify({'error': 'League name is required'}), 400
    
    league = League(
        name=data['name'],
        description=data.get('description', ''),
        num_rounds=data.get('num_rounds', 3)
    )
    
    db.session.add(league)
    db.session.commit()
    
    return jsonify(league.to_dict()), 201

@leagues_bp.route('/<int:league_id>', methods=['PUT'])
def update_league(league_id):
    league = League.query.get_or_404(league_id)
    data = request.get_json()
    
    if 'name' in data:
        league.name = data['name']
    if 'description' in data:
        league.description = data['description']
    if 'num_rounds' in data:
        league.num_rounds = data['num_rounds']
    if 'draft_started' in data:
        league.draft_started = data['draft_started']
    if 'draft_completed' in data:
        league.draft_completed = data['draft_completed']
    if 'current_pick_number' in data:
        league.current_pick_number = data['current_pick_number']
    
    league.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(league.to_dict()), 200

@leagues_bp.route('/<int:league_id>', methods=['DELETE'])
def delete_league(league_id):
    league = League.query.get_or_404(league_id)
    db.session.delete(league)
    db.session.commit()
    return jsonify({'message': 'League deleted successfully'}), 200

@leagues_bp.route('/<int:league_id>/initialize', methods=['POST'])
def initialize_league(league_id):
    league = League.query.get_or_404(league_id)
    data = request.get_json()
    
    if not data or 'teams' not in data:
        return jsonify({'error': 'Teams data is required'}), 400
    
    teams_data = data['teams']
    
    for idx, team_data in enumerate(teams_data):
        team = Team(
            name=team_data['name'],
            icon=team_data.get('icon', 'Shield'),
            color=team_data.get('color', 'text-blue-500'),
            bg_color=team_data.get('bg_color', 'bg-blue-50'),
            draft_order=idx + 1,
            league_id=league.id
        )
        db.session.add(team)
    
    db.session.flush()
    
    teams = Team.query.filter_by(league_id=league.id).order_by(Team.draft_order).all()
    pick_number = 1
    
    for round_num in range(1, league.num_rounds + 1):
        team_order = teams if round_num % 2 == 1 else list(reversed(teams))
        
        for pick_in_round, team in enumerate(team_order, 1):
            draft_pick = DraftPick(
                pick_number=pick_number,
                round_number=round_num,
                pick_in_round=pick_in_round,
                original_team_id=team.id,
                current_team_id=team.id,
                league_id=league.id
            )
            db.session.add(draft_pick)
            pick_number += 1
    
    db.session.commit()
    
    return jsonify(league.to_dict(include_relations=True)), 201
