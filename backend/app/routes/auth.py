from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    jwt_required, set_access_cookies, set_refresh_cookies, unset_jwt_cookies
)
from ..helpers.jwt_helpers import get_user_identity_from_token, create_user_tokens
from ..helpers.mongo_helpers import (
    create_mongo_user, get_mongo_user_by_email, get_mongo_user_by_id,
    update_mongo_user_login_time, update_mongo_user
)
import logging

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    logger.info(f"Registration attempt for email: {data.get('email')}")
    
    # Validate required fields
    if not data.get('email') or not data.get('password'):
        logger.warning("Registration failed - missing email or password")
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Validate password length
    if len(data['password']) < 8:
        logger.warning("Registration failed - password too short")
        return jsonify({'error': 'Password must be at least 8 characters long'}), 400
    
    # Check if user exists in MongoDB
    if get_mongo_user_by_email(current_app.mongo, data['email']):
        logger.warning(f"Registration failed - email already exists: {data['email']}")
        return jsonify({'error': 'Email already registered'}), 400
    
    try:
        # Create user using helper function
        user = create_mongo_user(current_app.mongo, data)
        
        # Generate tokens using utility function
        access_token, refresh_token = create_user_tokens(str(user._id), user.name)
        
        logger.info(f"User registered successfully: {data['email']}")
        
        # Create response
        response = jsonify({
            'message': 'User registered successfully',
            'user': user.to_safe_dict()
        })
        
        # Set cookies in the response
        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)
        
        return response, 201
    except ValueError as e:
        logger.warning(f"Registration failed - validation error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Registration failed - unexpected error: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    logger.info(f"Login attempt for email: {data.get('email')}")
    
    # Validate required fields
    if not data.get('email') or not data.get('password'):
        logger.warning("Login failed - missing email or password")
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = get_mongo_user_by_email(current_app.mongo, data['email'])
    
    if not user:
        logger.warning(f"Login failed - user not found: {data['email']}")
        return jsonify({'error': 'Invalid credentials'}), 401
    
    try:
        if not user.check_password(data['password']):
            logger.warning(f"Login failed - invalid password for: {data['email']}")
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Update last login
        login_time = update_mongo_user_login_time(current_app.mongo, user._id)
        
        # Generate tokens using utility function
        access_token, refresh_token = create_user_tokens(str(user._id), user.name)
        
        logger.info(f"User logged in successfully: {data['email']} at {login_time}")
        
        # Create response
        response = jsonify({
            'user': user.to_safe_dict()
        })
        
        # Set cookies in the response
        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)
        
        return response
    except ValueError as e:
        logger.warning(f"Login failed - validation error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Login failed - unexpected error: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    # Get current user identity using utility function
    user_id, user_name = get_user_identity_from_token()
    
    # Create new tokens using utility function
    access_token, refresh_token = create_user_tokens(user_id, user_name)
    
    response = jsonify({'status': 'success'})
    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)
    
    return response

@auth_bp.route('/logout', methods=['POST'])
def logout():
    response = jsonify({'status': 'success'})
    unset_jwt_cookies(response)
    return response

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    # Get user identity using utility function
    user_id, _ = get_user_identity_from_token()
    
    user = get_mongo_user_by_id(current_app.mongo, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_safe_dict())

@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_current_user():
    # Get user identity using utility function
    user_id, _ = get_user_identity_from_token()
    
    user = get_mongo_user_by_id(current_app.mongo, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    update_fields = {}
    if 'name' in data:
        update_fields['name'] = data['name']
    if 'password' in data:
        user.set_password(data['password'])
        update_fields['password_hash'] = user.password_hash
    
    if update_fields:
        updated_user = update_mongo_user(current_app.mongo, user_id, update_fields)
        return jsonify(updated_user.to_safe_dict())
    
    return jsonify(user.to_safe_dict()) 