from flask import Blueprint, request, jsonify
from .models import db, Trade, DraftPick
import json
from datetime import datetime

trades_bp = Blueprint('trades', __name__)

@trades_bp.route('', methods=['GET'])
def get_trades():
    league_id = request.args.get('league_id', type=int)
    
    if league_id:
        trades = Trade.query.filter_by(league_id=league_id).order_by(Trade.executed_at.desc()).all()
    else:
        trades = Trade.query.all()
    
    return jsonify([trade.to_dict() for trade in trades]), 200

@trades_bp.route('/<int:trade_id>', methods=['GET'])
def get_trade(trade_id):
    trade = Trade.query.get_or_404(trade_id)
    return jsonify(trade.to_dict()), 200

@trades_bp.route('', methods=['POST'])
def execute_trade():
    data = request.get_json()
    
    if not data or 'from_team_id' not in data or 'to_team_id' not in data or 'pick_ids' not in data or 'league_id' not in data:
        return jsonify({'error': 'from_team_id, to_team_id, pick_ids, and league_id are required'}), 400
    
    from_team_id = data['from_team_id']
    to_team_id = data['to_team_id']
    pick_ids = data['pick_ids']
    league_id = data['league_id']
    
    if from_team_id == to_team_id:
        return jsonify({'error': 'Cannot trade with the same team'}), 400
    
    if not isinstance(pick_ids, list) or len(pick_ids) == 0:
        return jsonify({'error': 'pick_ids must be a non-empty array'}), 400
    
    picks = DraftPick.query.filter(
        DraftPick.id.in_(pick_ids),
        DraftPick.league_id == league_id
    ).all()
    
    if len(picks) != len(pick_ids):
        return jsonify({'error': 'Some picks not found'}), 404
    
    for pick in picks:
        if pick.current_team_id != from_team_id:
            return jsonify({'error': f'Pick {pick.id} does not belong to team {from_team_id}'}), 400
        if pick.is_used:
            return jsonify({'error': f'Pick {pick.id} has already been used'}), 400
    
    for pick in picks:
        pick.current_team_id = to_team_id
        pick.updated_at = datetime.utcnow()
    
    trade = Trade(
        from_team_id=from_team_id,
        to_team_id=to_team_id,
        pick_ids=json.dumps(pick_ids),
        league_id=league_id
    )
    
    db.session.add(trade)
    db.session.commit()
    
    return jsonify({
        'message': 'Trade executed successfully',
        'trade': trade.to_dict(),
        'picks': [pick.to_dict() for pick in picks]
    }), 201

@trades_bp.route('/<int:trade_id>', methods=['DELETE'])
def delete_trade(trade_id):
    trade = Trade.query.get_or_404(trade_id)
    db.session.delete(trade)
    db.session.commit()
    return jsonify({'message': 'Trade deleted successfully'}), 200
