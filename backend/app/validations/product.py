from typing import List, Dict, Any
from datetime import datetime
import re
from urllib.parse import urlparse

class ValidationError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class ProductValidator:
    # Business rules - easily modifiable
    BUSINESS_RULES = {
        'title': {
            'min_length': 3,
            'max_length': 100,
            'pattern': r'^[a-zA-Z0-9\s\-_.,]+$'
        },
        'description': {
            'max_length': 2000
        },
        'price': {
            'min': 0,
            'max': 1000000,
            'decimal_places': 2
        },
        'sku': {
            'pattern': r'^[A-Z0-9\-_]+$',
            'min_length': 3,
            'max_length': 50
        },
        'image_url': {
            'allowed_domains': ['cdn.shopify.com', 'your-domain.com']
        }
    }

    @staticmethod
    def validate_title(title: str) -> List[str]:
        errors = []
        rules = ProductValidator.BUSINESS_RULES['title']
        
        if not isinstance(title, str):
            errors.append("Title must be a string")
            return errors
            
        title = title.strip()
        if not title:
            errors.append("Title cannot be empty")
            return errors
            
        if len(title) < rules['min_length']:
            errors.append(f"Title must be at least {rules['min_length']} characters long")
            
        if len(title) > rules['max_length']:
            errors.append(f"Title cannot exceed {rules['max_length']} characters")
            
        if not re.match(rules['pattern'], title):
            errors.append("Title can only contain letters, numbers, spaces, and basic punctuation")
            
        return errors

    @staticmethod
    def validate_description(description: str) -> List[str]:
        errors = []
        rules = ProductValidator.BUSINESS_RULES['description']
        
        if not isinstance(description, str):
            errors.append("Description must be a string")
            return errors
            
        if len(description) > rules['max_length']:
            errors.append(f"Description cannot exceed {rules['max_length']} characters")
            
        return errors

    @staticmethod
    def validate_price(price: Any) -> List[str]:
        errors = []
        rules = ProductValidator.BUSINESS_RULES['price']
        
        try:
            price = float(price)
        except (ValueError, TypeError):
            errors.append("Price must be a valid number")
            return errors
            
        if price < rules['min']:
            errors.append(f"Price cannot be less than {rules['min']}")
            
        if price > rules['max']:
            errors.append(f"Price cannot exceed {rules['max']}")
            
        # Check decimal places
        if len(str(price).split('.')[-1]) > rules['decimal_places']:
            errors.append(f"Price cannot have more than {rules['decimal_places']} decimal places")
            
        return errors

    @staticmethod
    def validate_sku(sku: str) -> List[str]:
        errors = []
        rules = ProductValidator.BUSINESS_RULES['sku']
        
        if not isinstance(sku, str):
            errors.append("SKU must be a string")
            return errors
            
        sku = sku.strip()
        if not sku:
            errors.append("SKU cannot be empty")
            return errors
            
        if len(sku) < rules['min_length']:
            errors.append(f"SKU must be at least {rules['min_length']} characters long")
            
        if len(sku) > rules['max_length']:
            errors.append(f"SKU cannot exceed {rules['max_length']} characters")
            
        if not re.match(rules['pattern'], sku):
            errors.append("SKU can only contain uppercase letters, numbers, hyphens, and underscores")
            
        return errors

    @staticmethod
    def validate_image_url(url: str) -> List[str]:
        errors = []
        rules = ProductValidator.BUSINESS_RULES['image_url']
        
        if not isinstance(url, str):
            errors.append("Image URL must be a string")
            return errors
            
        url = url.strip()
        if not url:
            errors.append("Image URL cannot be empty")
            return errors
            
        try:
            parsed = urlparse(url)
            if not parsed.scheme or not parsed.netloc:
                errors.append("Invalid URL format")
            elif parsed.netloc not in rules['allowed_domains']:
                errors.append(f"Image URL must be from one of: {', '.join(rules['allowed_domains'])}")
        except Exception:
            errors.append("Invalid URL format")
            
        return errors

    @staticmethod
    def validate_status(status: str) -> List[str]:
        errors = []
        allowed_status = ['active', 'draft', 'archived']
        
        if not isinstance(status, str):
            errors.append("Status must be a string")
            return errors
            
        if status not in allowed_status:
            errors.append(f"Status must be one of: {', '.join(allowed_status)}")
            
        return errors

    @classmethod
    def validate_create_data(cls, data: Dict[str, Any]) -> List[str]:
        errors = []
        
        # Required fields
        required_fields = ['title', 'description', 'price', 'sku']
        for field in required_fields:
            if field not in data:
                errors.append(f"Missing required field: {field}")
                
        # Validate each field if present
        if 'title' in data:
            errors.extend(cls.validate_title(data['title']))
            
        if 'description' in data:
            errors.extend(cls.validate_description(data['description']))
            
        if 'price' in data:
            errors.extend(cls.validate_price(data['price']))
            
        if 'sku' in data:
            errors.extend(cls.validate_sku(data['sku']))
            
        if 'image_url' in data:
            errors.extend(cls.validate_image_url(data['image_url']))
            
        return errors

    @classmethod
    def validate_update_data(cls, data: Dict[str, Any]) -> List[str]:
        errors = []
        
        # Validate each field if present
        if 'title' in data:
            errors.extend(cls.validate_title(data['title']))
            
        if 'description' in data:
            errors.extend(cls.validate_description(data['description']))
            
        if 'price' in data:
            errors.extend(cls.validate_price(data['price']))
            
        if 'sku' in data:
            errors.extend(cls.validate_sku(data['sku']))
            
        if 'image_url' in data:
            errors.extend(cls.validate_image_url(data['image_url']))
            
        if 'status' in data:
            errors.extend(cls.validate_status(data['status']))
            
        return errors

    @staticmethod
    def validate_query_params(params: Dict[str, Any]) -> List[str]:
        errors = []
        allowed_sort_fields = ['title', 'price', 'created_at', 'updated_at', 'sku']
        allowed_orders = ['asc', 'desc']
        
        if 'sort_by' in params and params['sort_by'] not in allowed_sort_fields:
            errors.append(f"Sort field must be one of: {', '.join(allowed_sort_fields)}")
            
        if 'order' in params and params['order'] not in allowed_orders:
            errors.append(f"Sort order must be one of: {', '.join(allowed_orders)}")
            
        try:
            page = int(params.get('page', 1))
            if page < 1:
                errors.append("Page number must be positive")
        except ValueError:
            errors.append("Page number must be a valid integer")
            
        try:
            per_page = int(params.get('per_page', 20))
            if per_page < 1 or per_page > 100:
                errors.append("Items per page must be between 1 and 100")
        except ValueError:
            errors.append("Items per page must be a valid integer")
            
        return errors

    @staticmethod
    def validate_product_id(product_id: str) -> List[str]:
        errors = []
        from bson.objectid import ObjectId
        
        try:
            if not ObjectId.is_valid(product_id):
                errors.append("Invalid product ID format")
        except Exception:
            errors.append("Invalid product ID")
            
        return errors 