from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId

class User:
    def __init__(self, email, password=None, name=None):
        self.email = email
        self.password_hash = generate_password_hash(password) if password else None
        self.name = name
        self.created_at = datetime.now(timezone.utc)
        self.last_login = None
    
    def set_password(self, password):
        if not password:
            raise ValueError("Password is required")
        self.password_hash = generate_password_hash(password)
    
    @staticmethod
    def from_dict(data):
        if not data.get('email'):
            raise ValueError("Email is required")
            
        user = User(data['email'], '')  # Temporary password
        user.password_hash = data.get('password_hash')  # Make password_hash optional
        user.name = data.get('name')
        user.created_at = data.get('created_at', datetime.now(timezone.utc))
        user.last_login = data.get('last_login')
        user._id = data.get('_id')
        return user
    
    def to_dict(self):
        return {
            'email': self.email,
            'password_hash': self.password_hash,
            'name': self.name,
            'created_at': self.created_at,
            'last_login': self.last_login
        }
    
    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)
    
    @property
    def id(self):
        return str(self._id) if hasattr(self, '_id') else None 