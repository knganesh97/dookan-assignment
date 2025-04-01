from datetime import datetime, timezone
from .. import bcrypt
from bson import ObjectId

class User:
    def __init__(self, email, password=None, name=None):
        self.email = email
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8') if password else None
        self.name = name
        self.created_at = datetime.now(timezone.utc)
        self.last_login = None
    
    def set_password(self, password):
        if not password:
            raise ValueError("Password is required")
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    @staticmethod
    def from_dict(data):
        if not data.get('email'):
            raise ValueError("Email is required")
            
        user = User(data['email'], '')  # Temporary password
        user.password_hash = data.get('password_hash')  # Make password_hash optional
        user.name = data.get('name')
        user.created_at = data.get('created_at', datetime.now(timezone.utc))
        user.last_login = data.get('last_login')
        
        _id = data.get('_id')
        if _id and isinstance(_id, str):
            user._id = ObjectId(_id)
        else:
            user._id = _id
            
        return user
    
    def to_dict(self):
        return {
            'email': self.email,
            'password_hash': self.password_hash,
            'name': self.name,
            'created_at': self.created_at,
            'last_login': self.last_login
        }
    
    def to_safe_dict(self):
        """Return user data without sensitive information"""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'created_at': self.created_at,
            'last_login': self.last_login
        }
    
    def check_password(self, password):
        if not self.password_hash:
            return False
        return bcrypt.check_password_hash(self.password_hash, password)
    
    @property
    def id(self):
        return str(self._id) if hasattr(self, '_id') else None 