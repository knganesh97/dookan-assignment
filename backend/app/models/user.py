from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId

class User:
    def __init__(self, email, password, name=None):
        self.email = email
        self.password_hash = generate_password_hash(password)
        self.name = name
        self.created_at = datetime.utcnow()
        self.last_login = None
    
    @staticmethod
    def from_dict(data):
        user = User(data['email'], '')  # Password will be set separately
        user.password_hash = data['password_hash']
        user.name = data.get('name')
        user.created_at = data.get('created_at', datetime.utcnow())
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
        return check_password_hash(self.password_hash, password)
    
    @property
    def id(self):
        return str(self._id) if hasattr(self, '_id') else None 