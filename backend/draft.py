from flask import Blueprint, request, jsonify
from .models import db, DraftPick, Prospect, League
from datetime import datetime

draft_bp = Blueprint('draft', __name__)

@draft_bp.route('/picks', methods=['GET'])
def get_draft_picks():
    league_id = request.args.get('league_id', type=int)
    
    if not league_id:
        return jsonify({'error': 'league_id is required'}), 400
    
    picks = DraftPick.query.filter_by(league_id=league_id).order_by(DraftPick.pick_number).all()
    return jsonify([pick.to_dict() for pick in picks]), 200

@draft_bp.route('/picks/<int:pick_id>', methods=['GET'])
def get_draft_pick(pick_id):
    pick = DraftPick.query.get_or_404(pick_id)
    return jsonify(pick.to_dict()), 200

@draft_bp.route('/execute', methods=['POST'])
def execute_draft():
    data = request.get_json()
    
    if not data or 'prospect_id' not in data or 'team_id' not in data or 'league_id' not in data:
        return jsonify({'error': 'prospect_id, team_id, and league_id are required'}), 400
    
    prospect_id = data['prospect_id']
    team_id = data['team_id']
    league_id = data['league_id']
    
    league = League.query.get_or_404(league_id)
    prospect = Prospect.query.get_or_404(prospect_id)
    
    if prospect.is_drafted:
        return jsonify({'error': 'Prospect already drafted'}), 400
    
    current_pick = DraftPick.query.filter_by(
        league_id=league_id,
        pick_number=league.current_pick_number
    ).first()
    
    if not current_pick:
        return jsonify({'error': 'No current pick available'}), 400
    
    prospect.is_drafted = True
    prospect.drafted_by = team_id
    prospect.draft_pick_number = current_pick.pick_number
    prospect.updated_at = datetime.utcnow()
    
    current_pick.prospect_id = prospect_id
    current_pick.is_used = True
    current_pick.updated_at = datetime.utcnow()
    
    league.current_pick_number += 1
    league.updated_at = datetime.utcnow()
    
    total_picks = DraftPick.query.filter_by(league_id=league_id).count()
    if league.current_pick_number > total_picks:
        league.draft_completed = True
    
    db.session.commit()
    
    return jsonify({
        'message': 'Draft executed successfully',
        'prospect': prospect.to_dict(),
        'pick': current_pick.to_dict(),
        'league': league.to_dict()
    }), 200

@draft_bp.route('/undraft', methods=['POST'])
def undraft_prospect():
    data = request.get_json()
    
    if not data or 'prospect_id' not in data or 'league_id' not in data:
        return jsonify({'error': 'prospect_id and league_id are required'}), 400
    
    prospect_id = data['prospect_id']
    league_id = data['league_id']
    
    prospect = Prospect.query.get_or_404(prospect_id)
    league = League.query.get_or_404(league_id)
    
    if not prospect.is_drafted:
        return jsonify({'error': 'Prospect is not drafted'}), 400
    
    draft_pick = DraftPick.query.filter_by(
        league_id=league_id,
        prospect_id=prospect_id
    ).first()
    
    if draft_pick:
        draft_pick.prospect_id = None
        draft_pick.is_used = False
        draft_pick.updated_at = datetime.utcnow()
    
    prospect.is_drafted = False
    prospect.drafted_by = None
    prospect.draft_pick_number = None
    prospect.updated_at = datetime.utcnow()
    
    if draft_pick and draft_pick.pick_number < league.current_pick_number:
        league.current_pick_number = draft_pick.pick_number
        league.draft_completed = False
        league.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Prospect undrafted successfully',
        'prospect': prospect.to_dict(),
        'league': league.to_dict()
    }), 200

@draft_bp.route('/current', methods=['GET'])
def get_current_pick():
    league_id = request.args.get('league_id', type=int)
    
    if not league_id:
        return jsonify({'error': 'league_id is required'}), 400
    
    league = League.query.get_or_404(league_id)
    
    current_pick = DraftPick.query.filter_by(
        league_id=league_id,
        pick_number=league.current_pick_number
    ).first()
    
    if not current_pick:
        return jsonify({'error': 'No current pick available'}), 404
    
    return jsonify(current_pick.to_dict()), 200
