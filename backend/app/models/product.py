from datetime import datetime, timezone
from bson import ObjectId

class Product:
    def __init__(self, title, description, price, sku, image_url=None, shopify_id=None, status='draft', currency='USD'):
        self.title = title
        self.description = description
        self.price = float(price)  # Ensure price is stored as float
        self.currency = currency
        self.price_text = f"{float(price):.2f}"  # Store price as string without currency
        self.sku = sku
        self.image_url = image_url
        self.thumbnail_url = image_url  # Can be processed version of main image
        self.shopify_id = shopify_id
        self.status = status  # draft, synced, failed
        self.created_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)
        self.last_sync = None
        self.is_deleted = False  # Soft delete flag
    
    @staticmethod
    def from_dict(data):
        product = Product(
            data['title'],
            data['description'],
            data['price'],
            data['sku'],
            data.get('image_url'),
            data.get('shopify_id'),
            data.get('status', 'draft'),
            data.get('currency', 'USD')
        )
        product.thumbnail_url = data.get('thumbnail_url', data.get('image_url'))
        product.created_at = data.get('created_at', datetime.now(timezone.utc))
        product.updated_at = data.get('updated_at', datetime.now(timezone.utc))
        product.last_sync = data.get('last_sync')
        product.is_deleted = data.get('is_deleted', False)
        product._id = data.get('_id')
        return product
    
    def to_dict(self):
        return {
            'id': self.id,
            'mongo_id': self.id,
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'currency': self.currency,
            'price_text': self.price_text,
            'sku': self.sku,
            'image_url': self.image_url,
            'thumbnail_url': self.thumbnail_url,
            'shopify_id': self.shopify_id,
            'status': self.status,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'last_sync': self.last_sync,
            'is_deleted': self.is_deleted
        }
    
    def to_table_dict(self):
        """Returns a dictionary with fields needed for the table display"""
        return {
            'id': self.id,
            'title': self.title,
            'sku': self.sku,
            'price': self.price,
            'currency': self.currency,
            'thumbnail_url': self.thumbnail_url,
            'status': self.status
        }
    
    def to_modal_dict(self):
        """Returns a dictionary with fields needed for the modal display"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'currency': self.currency,
            'image_url': self.image_url
        }
    
    @property
    def id(self):
        if hasattr(self, '_id'):
            if isinstance(self._id, ObjectId):
                return str(self._id)
            return str(self._id)
        return None
    
    def update(self, data):
        self.title = data.get('title', self.title)
        self.description = data.get('description', self.description)
        if 'price' in data:
            self.price = float(data['price'])
            self.price_text = f"{self.price:.2f}"
        if 'currency' in data:
            self.currency = data['currency']
        self.sku = data.get('sku', self.sku)
        self.image_url = data.get('image_url', self.image_url)
        self.thumbnail_url = data.get('thumbnail_url', data.get('image_url', self.thumbnail_url))
        self.updated_at = datetime.now(timezone.utc)
    
    def soft_delete(self):
        """Marks the product as deleted without removing from database"""
        self.is_deleted = True
        self.updated_at = datetime.now(timezone.utc)
    
    def sync_with_shopify(self, shopify_data):
        """Updates product with data from Shopify"""
        self.shopify_id = shopify_data.get('id', self.shopify_id)
        self.status = 'synced'
        self.last_sync = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc) 