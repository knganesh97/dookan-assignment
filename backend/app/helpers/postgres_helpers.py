from flask import current_app
from datetime import datetime, timezone, timedelta
from sqlalchemy import and_, desc, func, cast, Date
from ..models.event import Event
from .. import db

def create_event(user_id, product_id, event_type, user_name=None, product_title=None):
    """
    Create a new event record
    
    Args:
        user_id (str): MongoDB user ID
        product_id (str): MongoDB product ID
        event_type (str): Type of event ('create', 'update', or 'delete')
        user_name (str, optional): User's name for display purposes
        product_title (str, optional): Product's title for display purposes
        
    Returns:
        Event: The created event object
    """
    try:
        event = Event(
            user_id=user_id,
            user_name=user_name,
            product_id=product_id,
            product_title=product_title,
            event_type=event_type
        )
        
        db.session.add(event)
        db.session.commit()
        return event
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Failed to create event: {str(e)}")
        raise

def get_user_events(user_id, event_type=None, start_date=None, end_date=None, page=1, per_page=20):
    """
    Get events for a specific user with optional filtering
    
    Args:
        user_id (str): MongoDB user ID
        event_type (str, optional): Filter by event type
        start_date (datetime, optional): Filter events after this date
        end_date (datetime, optional): Filter events before this date
        page (int): Page number for pagination
        per_page (int): Number of items per page
        
    Returns:
        dict: Dictionary with events and pagination info
    """
    try:
        # Start with user_id filter to utilize the composite index
        query = Event.query.filter_by(user_id=user_id)
        
        # Build optimal filter chain based on what parameters exist
        if event_type and (start_date or end_date):
            # If filtering by both event type and date range
            conditions = []
            conditions.append(Event.event_type == event_type)
            
            if start_date:
                conditions.append(Event.timestamp >= start_date)
            if end_date:
                conditions.append(Event.timestamp <= end_date)
                
            query = query.filter(and_(*conditions))
        elif event_type:
            # Simple event type filter
            query = query.filter_by(event_type=event_type)
        elif start_date or end_date:
            # Date range only
            if start_date and end_date:
                query = query.filter(Event.timestamp.between(start_date, end_date))
            elif start_date:
                query = query.filter(Event.timestamp >= start_date)
            elif end_date:
                query = query.filter(Event.timestamp <= end_date)
        
        # Sort by timestamp descending - works with the composite index
        query = query.order_by(desc(Event.timestamp))
        
        # Apply pagination with count optimization
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'events': [event.to_dict() for event in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'total_pages': pagination.pages
        }
    except Exception as e:
        current_app.logger.error(f"Failed to get events: {str(e)}")
        raise

def get_events_by_timerange(start_date=None, end_date=None, event_type=None, page=1, per_page=20):
    """
    Get events within a time range, optionally filtered by event type
    
    Args:
        start_date (datetime, optional): Filter events after this date
        end_date (datetime, optional): Filter events before this date
        event_type (str, optional): Filter by event type
        page (int): Page number for pagination
        per_page (int): Number of items per page
        
    Returns:
        dict: Dictionary with events and pagination info
    """
    try:
        # Log input parameters for monitoring
        current_app.logger.info(f"Fetching events with filters: start_date={start_date}, end_date={end_date}, event_type={event_type}")
        
        # Choose the optimal query path based on filters
        if event_type:
            # Use the combined event_type + timestamp index
            query = Event.query.filter_by(event_type=event_type)
        else:
            # Use the timestamp index
            query = Event.query
        
        # Apply date filters
        if start_date and end_date:
            query = query.filter(Event.timestamp.between(start_date, end_date))
        elif start_date:
            query = query.filter(Event.timestamp >= start_date)
        elif end_date:
            query = query.filter(Event.timestamp <= end_date)
        
        # Sort by timestamp descending
        query = query.order_by(desc(Event.timestamp))
        
        # Apply pagination
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Log the result count for monitoring
        current_app.logger.info(f"Found {pagination.total} events matching the criteria")
        
        return {
            'events': [event.to_dict() for event in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'total_pages': pagination.pages
        }
    except Exception as e:
        current_app.logger.error(f"Failed to get events by timerange: {str(e)}")
        raise

def bulk_delete_old_events(days=30):
    """
    Delete events older than the specified number of days
    
    Args:
        days (int): Number of days to keep events (delete everything older)
        
    Returns:
        int: Number of events deleted
    """
    try:
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        # Get count before deletion for return value
        count_query = db.session.query(Event).filter(Event.timestamp < cutoff_date)
        events_to_delete = count_query.count()
        
        # Use timestamp index for efficient deletion
        db.session.query(Event).filter(Event.timestamp < cutoff_date).delete()
        db.session.commit()
        
        current_app.logger.info(f"Deleted {events_to_delete} events older than {days} days")
        return events_to_delete
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Failed to bulk delete events: {str(e)}")
        raise

def get_daily_event_counts(days=30):
    """
    Get daily counts of events by event_type for the specified number of past days
    
    Args:
        days (int): Number of past days to analyze (default: 30)
        
    Returns:
        dict: Dictionary containing:
            - dates: List of dates in YYYY-MM-DD format
            - event_types: List of unique event types found
            - counts: Dictionary with event_type keys, each containing a list of daily counts
    """
    try:
        # Calculate the start date (30 days ago from now)
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        # Query to get counts grouped by date and event_type
        results = db.session.query(
            cast(Event.timestamp, Date).label('date'),
            Event.event_type,
            func.count(Event.id).label('count')
        ).filter(
            Event.timestamp >= start_date
        ).group_by(
            cast(Event.timestamp, Date),
            Event.event_type
        ).order_by(
            cast(Event.timestamp, Date)
        ).all()
        
        # Process results into the desired format
        dates_set = set()
        event_types_set = set()
        counts_by_type = {}
        
        # First pass: collect all unique dates and event types
        for date, event_type, count in results:
            dates_set.add(date.strftime('%Y-%m-%d'))
            event_types_set.add(event_type)
        
        # Convert sets to sorted lists
        dates = sorted(list(dates_set))
        event_types = sorted(list(event_types_set))
        
        # Initialize counts dictionary with zeros
        for event_type in event_types:
            counts_by_type[event_type] = [0] * len(dates)
        
        # Fill in the actual counts
        date_to_index = {date: i for i, date in enumerate(dates)}
        for date, event_type, count in results:
            date_str = date.strftime('%Y-%m-%d')
            index = date_to_index[date_str]
            counts_by_type[event_type][index] = count
        
        return {
            'dates': dates,
            'event_types': event_types,
            'counts': counts_by_type
        }
    except Exception as e:
        current_app.logger.error(f"Failed to get daily event counts: {str(e)}")
        raise 