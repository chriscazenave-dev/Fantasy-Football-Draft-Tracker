from flask import Blueprint, request, jsonify
from .models import db, Prospect
from datetime import datetime

prospects_bp = Blueprint('prospects', __name__)

@prospects_bp.route('', methods=['GET'])
def get_prospects():
    league_id = request.args.get('league_id', type=int)
    position = request.args.get('position')
    is_drafted = request.args.get('is_drafted')
    
    query = Prospect.query
    
    if league_id:
        query = query.filter_by(league_id=league_id)
    
    if position:
        query = query.filter_by(position=position)
    
    if is_drafted is not None:
        drafted_bool = is_drafted.lower() == 'true'
        query = query.filter_by(is_drafted=drafted_bool)
    
    prospects = query.all()
    return jsonify([prospect.to_dict() for prospect in prospects]), 200

@prospects_bp.route('/<int:prospect_id>', methods=['GET'])
def get_prospect(prospect_id):
    prospect = Prospect.query.get_or_404(prospect_id)
    return jsonify(prospect.to_dict()), 200

@prospects_bp.route('', methods=['POST'])
def create_prospect():
    data = request.get_json()
    
    if not data or 'name' not in data or 'position' not in data or 'league_id' not in data:
        return jsonify({'error': 'Name, position, and league_id are required'}), 400
    
    prospect = Prospect(
        name=data['name'],
        position=data['position'],
        college=data.get('college', ''),
        league_id=data['league_id']
    )
    
    db.session.add(prospect)
    db.session.commit()
    
    return jsonify(prospect.to_dict()), 201

@prospects_bp.route('/bulk', methods=['POST'])
def create_prospects_bulk():
    data = request.get_json()
    
    if not data or 'prospects' not in data or 'league_id' not in data:
        return jsonify({'error': 'Prospects array and league_id are required'}), 400
    
    league_id = data['league_id']
    prospects_data = data['prospects']
    
    prospects = []
    for prospect_data in prospects_data:
        if 'name' not in prospect_data or 'position' not in prospect_data:
            continue
        
        prospect = Prospect(
            name=prospect_data['name'],
            position=prospect_data['position'],
            college=prospect_data.get('college', ''),
            league_id=league_id
        )
        prospects.append(prospect)
        db.session.add(prospect)
    
    db.session.commit()
    
    return jsonify({
        'message': f'{len(prospects)} prospects created successfully',
        'prospects': [p.to_dict() for p in prospects]
    }), 201

@prospects_bp.route('/<int:prospect_id>', methods=['PUT'])
def update_prospect(prospect_id):
    prospect = Prospect.query.get_or_404(prospect_id)
    data = request.get_json()
    
    if 'name' in data:
        prospect.name = data['name']
    if 'position' in data:
        prospect.position = data['position']
    if 'college' in data:
        prospect.college = data['college']
    
    prospect.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(prospect.to_dict()), 200

@prospects_bp.route('/<int:prospect_id>', methods=['DELETE'])
def delete_prospect(prospect_id):
    prospect = Prospect.query.get_or_404(prospect_id)
    db.session.delete(prospect)
    db.session.commit()
    return jsonify({'message': 'Prospect deleted successfully'}), 200
