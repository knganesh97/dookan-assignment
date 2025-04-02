from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from datetime import datetime, timezone, timedelta
from ..helpers.postgres_helpers import get_user_events, get_events_by_timerange
from ..helpers.mongo_helpers import get_mongo_users_name_and_id
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
    else:
        # Default to 30 days ago
        start_date = datetime.now(timezone.utc) - timedelta(days=30)
    
    end_date = None
    if 'end_date' in request.args:
        try:
            end_date = datetime.fromisoformat(request.args.get('end_date'))
            # Ensure timezone awareness
            if end_date.tzinfo is None:
                end_date = end_date.replace(tzinfo=timezone.utc)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400
    else:
        # Default to current time since we don't have future events
        end_date = datetime.now(timezone.utc)

    # Log the query parameters
    current_app.logger.info(f"Query parameters: start_date={start_date}, end_date={end_date}, user_id={user_id}, event_type={event_type}")

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
        
        # Log the result
        current_app.logger.info(f"Query result: {result}")
        return jsonify(result)
    except Exception as e:
        current_app.logger.error(f"Error fetching events: {str(e)}")
        return jsonify({'error': 'Failed to fetch events'}), 500

@events_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users_list():
    """Get a list of all users with only their names and IDs"""
    try:
        users = get_mongo_users_name_and_id(current_app.mongo)
        return jsonify(users)
    except Exception as e:
        current_app.logger.error(f"Failed to retrieve users list: {str(e)}")
        return jsonify({'error': 'Failed to retrieve users list'}), 500
    