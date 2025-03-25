from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask extensions
db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # Configure app
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('POSTGRES_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    
    # Initialize MongoDB
    mongo_client = MongoClient(os.getenv('MONGODB_URI'))
    app.mongo = mongo_client.dookan
    
    # Initialize extensions
    CORS(app)
    db.init_app(app)
    jwt.init_app(app)
    
    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.shopify import shopify_bp
    from .routes.events import events_bp
    from .routes.analytics import analytics_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(shopify_bp, url_prefix='/api/shopify')
    app.register_blueprint(events_bp, url_prefix='/api/events')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app 