from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token

# Initialize SQLAlchemy
db = SQLAlchemy()

# Association table for many-to-many relationship between users and groups
user_groups = db.Table('user_groups',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('group_id', db.Integer, db.ForeignKey('group.id'), primary_key=True),
    db.Column('joined_at', db.DateTime, default=datetime.utcnow)
)

class User(db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    expenses = db.relationship('Expense', backref='payer', lazy=True, foreign_keys='Expense.payer_id')
    groups = db.relationship('Group', secondary=user_groups, back_populates='members')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def generate_auth_token(self):
        return create_access_token(identity=self.id)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }

class Group(db.Model):
    __tablename__ = 'group'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationships
    members = db.relationship('User', secondary=user_groups, back_populates='groups')
    expenses = db.relationship('Expense', backref='group', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'member_count': len(self.members)
        }

class Expense(db.Model):
    __tablename__ = 'expense'
    
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    payer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('group.id'), nullable=True)
    
    # Relationships
    splits = db.relationship('ExpenseSplit', back_populates='expense', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'amount': float(self.amount),
            'date': self.date.isoformat(),
            'payer_id': self.payer_id,
            'group_id': self.group_id,
            'created_at': self.created_at.isoformat(),
            'splits': [split.to_dict() for split in self.splits]
        }

class ExpenseSplit(db.Model):
    __tablename__ = 'expense_split'
    
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    is_settled = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    expense_id = db.Column(db.Integer, db.ForeignKey('expense.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationships
    expense = db.relationship('Expense', back_populates='splits')
    user = db.relationship('User')
    
    def to_dict(self):
        return {
            'id': self.id,
            'amount': float(self.amount),
            'is_settled': self.is_settled,
            'user_id': self.user_id,
            'expense_id': self.expense_id,
            'user': self.user.to_dict() if self.user else None
        }
