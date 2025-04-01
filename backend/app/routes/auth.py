from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required, get_jwt_identity,
    set_access_cookies, set_refresh_cookies, unset_jwt_cookies
)
from datetime import datetime, timezone
from ..models.user import User
from bson import ObjectId
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
    if current_app.mongo.users.find_one({'email': data['email']}):
        logger.warning(f"Registration failed - email already exists: {data['email']}")
        return jsonify({'error': 'Email already registered'}), 400
    
    try:
        user = User(
            email=data['email'],
            password=data['password'],
            name=data.get('name', '')
        )
        
        # Insert into MongoDB
        result = current_app.mongo.users.insert_one(user.to_dict())
        user._id = result.inserted_id
        
        # Generate tokens after successful registration
        access_token = create_access_token(identity=str(user._id))
        refresh_token = create_refresh_token(identity=str(user._id))
        
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
    
    user_data = current_app.mongo.users.find_one({'email': data['email']})
    
    if not user_data:
        logger.warning(f"Login failed - user not found: {data['email']}")
        return jsonify({'error': 'Invalid credentials'}), 401
    
    try:
        user = User.from_dict(user_data)
        
        if not user.check_password(data['password']):
            logger.warning(f"Login failed - invalid password for: {data['email']}")
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Update last login
        user.last_login = datetime.now(timezone.utc)
        current_app.mongo.users.update_one(
            {'_id': user._id},
            {'$set': {'last_login': user.last_login}}
        )
        
        access_token = create_access_token(identity=str(user._id))
        refresh_token = create_refresh_token(identity=str(user._id))
        
        logger.info(f"User logged in successfully: {data['email']}")
        
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
    current_user_id = get_jwt_identity()
    access_token = create_access_token(identity=current_user_id)
    refresh_token = create_refresh_token(identity=current_user_id)
    
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
    current_user_id = get_jwt_identity()
    user_data = current_app.mongo.users.find_one({'_id': ObjectId(current_user_id)})
    
    if not user_data:
        return jsonify({'error': 'User not found'}), 404
    
    user = User.from_dict(user_data)
    return jsonify(user.to_safe_dict())

@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_current_user():
    current_user_id = get_jwt_identity()
    user_data = current_app.mongo.users.find_one({'_id': ObjectId(current_user_id)})
    
    if not user_data:
        return jsonify({'error': 'User not found'}), 404
    
    user = User.from_dict(user_data)
    data = request.get_json()
    
    update_fields = {}
    if 'name' in data:
        update_fields['name'] = data['name']
    if 'password' in data:
        user.set_password(data['password'])
        update_fields['password_hash'] = user.password_hash
    
    if update_fields:
        current_app.mongo.users.update_one(
            {'_id': user._id},
            {'$set': update_fields}
        )
    
    # Get updated user data
    updated_user = User.from_dict(current_app.mongo.users.find_one({'_id': user._id}))
    return jsonify(updated_user.to_safe_dict()) 