from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from datetime import datetime, timezone
from ..helpers.postgres_helpers import get_user_events, get_events_by_timerange
from .. import db

events_bp = Blueprint('events', __name__)

@events_bp.route('', methods=['GET'])
@jwt_required()
def get_events():
    # Extract query parameters
    user_id = request.args.get('user_id')
    event_type = request.args.get('event_type')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    
    # Parse date parameters if provided
    start_date = None
    if 'start_date' in request.args:
        try:
            start_date = datetime.fromisoformat(request.args.get('start_date'))
            # Ensure timezone awareness
            if start_date.tzinfo is None:
                start_date = start_date.replace(tzinfo=timezone.utc)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400
    
    end_date = None
    if 'end_date' in request.args:
        try:
            end_date = datetime.fromisoformat(request.args.get('end_date'))
            # Ensure timezone awareness
            if end_date.tzinfo is None:
                end_date = end_date.replace(tzinfo=timezone.utc)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400
    
    # Choose the appropriate query method based on parameters
    try:
        if user_id:
            # If user_id is provided, use the user-specific query method
            result = get_user_events(
                user_id=user_id,
                event_type=event_type,
                start_date=start_date,
                end_date=end_date,
                page=page,
                per_page=per_page
            )
        else:
            # Without user_id, use the time range query method
            result = get_events_by_timerange(
                start_date=start_date,
                end_date=end_date,
                event_type=event_type,
                page=page,
                per_page=per_page
            )
        
        return jsonify(result)
    except Exception as e:
        current_app.logger.error(f"Error fetching events: {str(e)}")
        return jsonify({'error': 'Failed to fetch events'}), 500
    