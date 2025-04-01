from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from .config import config

# Load environment variables
load_dotenv()

# Initialize Flask extensions
db = SQLAlchemy()
jwt = JWTManager()

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Configure app
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', config['default'].SECRET_KEY)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('POSTGRES_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', config['default'].JWT_SECRET_KEY)
    
    # SSL Configuration
    app.config['SSL_ENABLED'] = os.getenv('SSL_ENABLED', 'False').lower() == 'true'
    app.config['SSL_CERT_PATH'] = os.getenv('SSL_CERT_PATH', './cert.pem')
    app.config['SSL_KEY_PATH'] = os.getenv('SSL_KEY_PATH', './key.pem')
    
    # JWT Configuration
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 15 * 60  # 15 minutes in seconds
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = 7 * 24 * 60 * 60  # 7 days in seconds
    
    # JWT Cookie Configuration
    app.config['JWT_TOKEN_LOCATION'] = ['cookies']
    app.config['JWT_COOKIE_SECURE'] = app.config['SSL_ENABLED'] or os.getenv('ENV') == 'production'
    app.config['JWT_COOKIE_CSRF_PROTECT'] = True  # Enable CSRF protection
    app.config['JWT_COOKIE_SAMESITE'] = 'Lax'  # Restrict cookie sending to same-site requests with some exceptions
    app.config['JWT_COOKIE_DOMAIN'] = None  # Use this to specify a domain if needed
    app.config['JWT_ACCESS_COOKIE_PATH'] = '/api/'  # Path for access token cookie
    app.config['JWT_REFRESH_COOKIE_PATH'] = '/api/auth/refresh'  # Path for refresh token cookie
    app.config['JWT_CSRF_IN_COOKIES'] = True  # Store CSRF tokens in cookies
    
    # Initialize MongoDB
    mongo_client = MongoClient(os.getenv('MONGODB_URI'))
    app.mongo = mongo_client.dookan
    
    # Initialize extensions
    CORS(app, 
         resources={r"/api/*": {
             "origins": [os.getenv('FRONTEND_URL')],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization", "Accept", "X-CSRF-TOKEN"],
             "supports_credentials": True,
             "expose_headers": ["Content-Type", "Authorization"],
             "max_age": 3600,
             "allow_credentials": True
         }})
    
    db.init_app(app)
    jwt.init_app(app)
    
    # Create unique index on email field
    with app.app_context():
        app.mongo.users.create_index([('email', 1)], unique=True)
    
    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.shopify import shopify_bp
    from .routes.events import events_bp
    from .routes.analytics import analytics_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(shopify_bp, url_prefix='/api')
    app.register_blueprint(events_bp, url_prefix='/api/events')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app 