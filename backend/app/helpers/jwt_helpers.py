from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity
import json
from typing import Tuple, Optional

def get_user_identity_from_token() -> Tuple[str, Optional[str]]:
    """
    Get user ID and name from JWT token with backwards compatibility.
    Returns a tuple of (user_id, user_name).
    """
    jwt_identity = get_jwt_identity()
    try:
        user_data = json.loads(jwt_identity)
        if isinstance(user_data, dict):
            return user_data.get('id'), user_data.get('name')
        return user_data, None  # Legacy format
    except json.JSONDecodeError:
        return jwt_identity, None  # Fallback for legacy format

def create_user_tokens(user_id: str, user_name: Optional[str] = None) -> Tuple[str, str]:
    """
    Create access and refresh tokens with standardized user identity format.
    Returns a tuple of (access_token, refresh_token).
    """
    user_identity = json.dumps({
        'id': str(user_id),
        'name': user_name or ''
    })
    access_token = create_access_token(identity=user_identity)
    refresh_token = create_refresh_token(identity=user_identity)
    return access_token, refresh_token 