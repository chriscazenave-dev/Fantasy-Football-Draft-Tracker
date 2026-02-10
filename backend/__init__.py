from flask import Flask, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from .models import db
from .config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)
    CORS(app)
    
    # Register blueprints
    from .leagues import leagues_bp
    from .teams import teams_bp
    from .prospects import prospects_bp
    from .draft import draft_bp
    from .trades import trades_bp
    
    app.register_blueprint(leagues_bp, url_prefix='/api/leagues')
    app.register_blueprint(teams_bp, url_prefix='/api/teams')
    app.register_blueprint(prospects_bp, url_prefix='/api/prospects')
    app.register_blueprint(draft_bp, url_prefix='/api/draft')
    app.register_blueprint(trades_bp, url_prefix='/api/trades')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app
