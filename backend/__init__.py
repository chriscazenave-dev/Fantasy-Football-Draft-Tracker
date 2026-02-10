from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS
from .models import db
from .config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    migrate = Migrate(app, db)
    CORS(app)
    
    # Register blueprints
    from .auth import auth_bp
    from .groups import groups_bp
    from .expenses import expenses_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(groups_bp, url_prefix='/api/groups')
    app.register_blueprint(expenses_bp, url_prefix='/api/expenses')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app
