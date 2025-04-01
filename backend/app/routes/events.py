from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models.event import Event
from .. import db

events_bp = Blueprint('events', __name__)

@events_bp.route('', methods=['POST'])
@jwt_required()
def create_event():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    event = Event(
        user_id=user_id,
        event_type=data['event_type'],
        description=data.get('description', ''),
        metadata=data.get('metadata', {}),
        ip_address=request.remote_addr,
        user_agent=request.user_agent.string
    )
    
    db.session.add(event)
    db.session.commit()
    
    return jsonify({'message': 'Event logged successfully'}), 201

@events_bp.route('', methods=['GET'])
@jwt_required()
def get_events():
    user_id = get_jwt_identity()
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    event_type = request.args.get('event_type')
    
    query = Event.query.filter_by(user_id=user_id)
    if event_type:
        query = query.filter_by(event_type=event_type)
    
    events = query.order_by(Event.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'events': [event.to_dict() for event in events.items],
        'total': events.total,
        'page': page,
        'per_page': per_page
    })

@events_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_event_stats():
    user_id = get_jwt_identity()
    
    # Get event type counts using SQLAlchemy
    from sqlalchemy import func
    stats = db.session.query(
        Event.event_type,
        func.count(Event.id).label('count')
    ).filter_by(user_id=user_id).group_by(Event.event_type).all()
    
    return jsonify({
        'stats': [{'event_type': stat[0], 'count': stat[1]} for stat in stats]
    })

@events_bp.route('/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    user_id = get_jwt_identity()
    
    event = Event.query.filter_by(id=event_id, user_id=user_id).first()
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    db.session.delete(event)
    db.session.commit()
    
    return jsonify({'message': 'Event deleted successfully'}) 