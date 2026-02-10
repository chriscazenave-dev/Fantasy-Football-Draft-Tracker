from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy
db = SQLAlchemy()

class League(db.Model):
    __tablename__ = 'league'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    num_rounds = db.Column(db.Integer, default=3)
    draft_started = db.Column(db.Boolean, default=False)
    draft_completed = db.Column(db.Boolean, default=False)
    current_pick_number = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    teams = db.relationship('Team', backref='league', lazy=True, cascade='all, delete-orphan')
    prospects = db.relationship('Prospect', backref='league', lazy=True, cascade='all, delete-orphan')
    draft_picks = db.relationship('DraftPick', backref='league', lazy=True, cascade='all, delete-orphan')
    trades = db.relationship('Trade', backref='league', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, include_relations=False):
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'num_rounds': self.num_rounds,
            'draft_started': self.draft_started,
            'draft_completed': self.draft_completed,
            'current_pick_number': self.current_pick_number,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        if include_relations:
            data['teams'] = [team.to_dict() for team in self.teams]
            data['prospects'] = [prospect.to_dict() for prospect in self.prospects]
            data['draft_picks'] = [pick.to_dict() for pick in self.draft_picks]
        return data

class Team(db.Model):
    __tablename__ = 'team'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(50), default='Shield')
    color = db.Column(db.String(50), default='text-blue-500')
    bg_color = db.Column(db.String(50), default='bg-blue-50')
    draft_order = db.Column(db.Integer, nullable=False)
    league_id = db.Column(db.Integer, db.ForeignKey('league.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    draft_picks = db.relationship('DraftPick', backref='current_team', lazy=True, foreign_keys='DraftPick.current_team_id')
    drafted_prospects = db.relationship('Prospect', backref='drafted_by_team', lazy=True)
    
    def to_dict(self, include_roster=False):
        data = {
            'id': self.id,
            'name': self.name,
            'icon': self.icon,
            'color': self.color,
            'bg_color': self.bg_color,
            'draft_order': self.draft_order,
            'league_id': self.league_id
        }
        if include_roster:
            data['roster'] = [prospect.to_dict() for prospect in self.drafted_prospects]
        return data

class Prospect(db.Model):
    __tablename__ = 'prospect'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    position = db.Column(db.String(20), nullable=False)
    college = db.Column(db.String(100))
    is_drafted = db.Column(db.Boolean, default=False)
    drafted_by = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=True)
    draft_pick_number = db.Column(db.Integer, nullable=True)
    league_id = db.Column(db.Integer, db.ForeignKey('league.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'position': self.position,
            'college': self.college,
            'is_drafted': self.is_drafted,
            'drafted_by': self.drafted_by,
            'draft_pick_number': self.draft_pick_number,
            'league_id': self.league_id
        }

class DraftPick(db.Model):
    __tablename__ = 'draft_pick'
    
    id = db.Column(db.Integer, primary_key=True)
    pick_number = db.Column(db.Integer, nullable=False)
    round_number = db.Column(db.Integer, nullable=False)
    pick_in_round = db.Column(db.Integer, nullable=False)
    original_team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    current_team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    prospect_id = db.Column(db.Integer, db.ForeignKey('prospect.id'), nullable=True)
    is_used = db.Column(db.Boolean, default=False)
    league_id = db.Column(db.Integer, db.ForeignKey('league.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    original_team = db.relationship('Team', foreign_keys=[original_team_id], backref='original_picks')
    prospect = db.relationship('Prospect', backref='draft_pick')
    
    def to_dict(self):
        return {
            'id': self.id,
            'pick_number': self.pick_number,
            'round_number': self.round_number,
            'pick_in_round': self.pick_in_round,
            'original_team_id': self.original_team_id,
            'current_team_id': self.current_team_id,
            'prospect_id': self.prospect_id,
            'is_used': self.is_used,
            'league_id': self.league_id
        }

class Trade(db.Model):
    __tablename__ = 'trade'
    
    id = db.Column(db.Integer, primary_key=True)
    from_team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    to_team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)
    pick_ids = db.Column(db.Text, nullable=False)  # JSON array of pick IDs
    league_id = db.Column(db.Integer, db.ForeignKey('league.id'), nullable=False)
    executed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    from_team = db.relationship('Team', foreign_keys=[from_team_id], backref='trades_from')
    to_team = db.relationship('Team', foreign_keys=[to_team_id], backref='trades_to')
    
    def to_dict(self):
        import json
        return {
            'id': self.id,
            'from_team_id': self.from_team_id,
            'to_team_id': self.to_team_id,
            'pick_ids': json.loads(self.pick_ids),
            'league_id': self.league_id,
            'executed_at': self.executed_at.isoformat()
        }
