from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from datetime import datetime, timezone
from ..models.user import User
from bson import ObjectId

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if user exists in MongoDB
    if current_app.mongo.users.find_one({'email': data['email']}):
        return jsonify({'error': 'Email already registered'}), 400
    
    user = User(
        email=data['email'],
        name=data.get('name', '')
    )
    user.set_password(data['password'])
    
    # Insert into MongoDB
    result = current_app.mongo.users.insert_one(user.to_dict())
    user._id = result.inserted_id
    
    # Generate tokens after successful registration
    access_token = create_access_token(identity=str(user._id))
    refresh_token = create_refresh_token(identity=str(user._id))
    
    return jsonify({
        'message': 'User registered successfully',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user_data = current_app.mongo.users.find_one({'email': data['email']})
    
    if not user_data:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    user = User.from_dict(user_data)
    
    if not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Update last login
    user.last_login = datetime.now(timezone.utc)
    current_app.mongo.users.update_one(
        {'_id': user._id},
        {'$set': {'last_login': user.last_login}}
    )
    
    access_token = create_access_token(identity=str(user._id))
    refresh_token = create_refresh_token(identity=str(user._id))
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    })

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    access_token = create_access_token(identity=current_user_id)
    return jsonify({'access_token': access_token})

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user_data = current_app.mongo.users.find_one({'_id': ObjectId(current_user_id)})
    
    if not user_data:
        return jsonify({'error': 'User not found'}), 404
    
    user = User.from_dict(user_data)
    return jsonify(user.to_dict())

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
    return jsonify(updated_user.to_dict()) 