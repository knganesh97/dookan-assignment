from datetime import datetime, timezone
from bson.objectid import ObjectId
from ..models.product import Product

def create_mongo_product(mongo, product_data):
    """Create a product in MongoDB"""
    try:
        product = Product(
            title=product_data['title'],
            description=product_data['description'],
            price=product_data['price'],
            sku=product_data['sku'],
            image_url=product_data.get('image_url')
        )
        result = mongo.products.insert_one(product.to_dict())
        product._id = result.inserted_id
        return product
    except Exception as e:
        raise Exception(f"MongoDB creation failed: {str(e)}")

def update_mongo_product(mongo, product_id, update_fields):
    """Update a product in MongoDB"""
    try:
        update_fields['updated_at'] = datetime.now(timezone.utc)
        
        result = mongo.products.update_one(
            {'_id': ObjectId(product_id)},
            {'$set': update_fields}
        )
        
        if result.modified_count == 0:
            raise Exception("No document was updated")
            
        updated_product = mongo.products.find_one({'_id': ObjectId(product_id)})
        return Product.from_dict(updated_product)
    except Exception as e:
        raise Exception(f"MongoDB update failed: {str(e)}")

def delete_mongo_product(mongo, product_id):
    """Soft delete a product in MongoDB"""
    try:
        product_data = mongo.products.find_one({
            '_id': ObjectId(product_id),
            'is_deleted': False
        })
        
        if not product_data:
            raise Exception("Product not found")
            
        product = Product.from_dict(product_data)
        product.soft_delete()
        
        result = mongo.products.update_one(
            {'_id': ObjectId(product_id)},
            {'$set': product.to_dict()}
        )
        
        if result.modified_count == 0:
            raise Exception("No document was deleted")
            
        return product
    except Exception as e:
        raise Exception(f"MongoDB deletion failed: {str(e)}") 