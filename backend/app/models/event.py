from .. import db
from datetime import datetime, timezone

class Event(db.Model):
    __tablename__ = 'identifier_events'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(120), nullable=False)  # MongoDB user ID
    user_name = db.Column(db.String(255))  # User's name for readability
    product_id = db.Column(db.String(120), nullable=False)  # MongoDB product ID
    product_title = db.Column(db.String(255))  # Product title for readability
    event_type = db.Column(db.String(50), nullable=False)  # create/update/delete
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Define optimized indexes for filtering
    __table_args__ = (
        db.Index('idx_events_user_timestamp', user_id, timestamp.desc()),
        db.Index('idx_events_type_timestamp', event_type, timestamp.desc()),
        db.Index('idx_events_timestamp', timestamp.desc()),    
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user_name,
            'product_id': self.product_id,
            'product_title': self.product_title,
            'event_type': self.event_type,
            'timestamp': self.timestamp.isoformat()
        } 