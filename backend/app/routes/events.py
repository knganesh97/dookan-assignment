from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import json

events_bp = Blueprint('events', __name__)

@events_bp.route('/', methods=['POST'])
@jwt_required()
def create_event():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    event = {
        'user_id': user_id,
        'event_type': data['event_type'],
        'description': data.get('description', ''),
        'metadata': data.get('metadata', {}),
        'created_at': datetime.utcnow(),
        'ip_address': request.remote_addr,
        'user_agent': request.user_agent.string
    }
    
    current_app.mongo.events.insert_one(event)
    return jsonify({'message': 'Event logged successfully'}), 201

@events_bp.route('/', methods=['GET'])
@jwt_required()
def get_events():
    user_id = get_jwt_identity()
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    event_type = request.args.get('event_type')
    
    query = {'user_id': user_id}
    if event_type:
        query['event_type'] = event_type
    
    events = list(current_app.mongo.events
                 .find(query)
                 .sort('created_at', -1)
                 .skip((page - 1) * per_page)
                 .limit(per_page))
    
    # Convert ObjectId to string for JSON serialization
    for event in events:
        event['_id'] = str(event['_id'])
        event['created_at'] = event['created_at'].isoformat()
    
    total = current_app.mongo.events.count_documents(query)
    
    return jsonify({
        'events': events,
        'total': total,
        'page': page,
        'per_page': per_page
    })

@events_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_event_stats():
    user_id = get_jwt_identity()
    
    pipeline = [
        {'$match': {'user_id': user_id}},
        {'$group': {
            '_id': '$event_type',
            'count': {'$sum': 1}
        }}
    ]
    
    stats = list(current_app.mongo.events.aggregate(pipeline))
    
    return jsonify({
        'stats': stats
    })

@events_bp.route('/<event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    user_id = get_jwt_identity()
    
    result = current_app.mongo.events.delete_one({
        '_id': event_id,
        'user_id': user_id
    })
    
    if result.deleted_count == 0:
        return jsonify({'error': 'Event not found'}), 404
    
    return jsonify({'message': 'Event deleted successfully'}) 