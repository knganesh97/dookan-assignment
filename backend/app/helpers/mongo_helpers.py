from datetime import datetime, timezone
from bson.objectid import ObjectId
from ..models.product import Product
from ..models.user import User

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

def get_mongo_products(mongo, sort_field='created_at', sort_order='desc', page=1, per_page=20, search_query=None):
    """Get paginated and sorted products from MongoDB with optional search"""
    try:
        # Convert sort order to MongoDB format (1 for ascending, -1 for descending)
        sort_direction = -1 if sort_order == 'desc' else 1
        
        # Build query
        query = {'is_deleted': False}
        if search_query:
            # Use regex for case-insensitive substring matching
            regex_pattern = {'$regex': search_query, '$options': 'i'}
            query = {
                'is_deleted': False,
                '$or': [
                    {'title': regex_pattern},
                    {'sku': regex_pattern},
                    {'price_text': regex_pattern},
                    {'currency': regex_pattern}
                ]
            }
        
        # Get total count for pagination
        total_count = mongo.products.count_documents(query)
        
        # Get paginated and sorted results
        products = mongo.products.find(query) \
            .sort(sort_field, sort_direction) \
            .skip((page - 1) * per_page) \
            .limit(per_page)
        
        return {
            'products': [Product.from_dict(p) for p in products],
            'total': total_count,
            'page': page,
            'per_page': per_page,
            'total_pages': (total_count + per_page - 1) // per_page
        }
    except Exception as e:
        raise Exception(f"MongoDB fetch failed: {str(e)}")

def get_mongo_product_by_id(mongo, product_id):
    """Get a single product by ID from MongoDB"""
    try:
        product_data = mongo.products.find_one({
            '_id': ObjectId(product_id),
            'is_deleted': False
        })
        
        if not product_data:
            raise Exception("Product not found")
            
        return Product.from_dict(product_data)
    except Exception as e:
        raise Exception(f"MongoDB fetch failed: {str(e)}")

def get_mongo_users(mongo):
    """Get all users from MongoDB"""
    try:
        users = mongo.users.find()
        return [User.from_dict(user) for user in users]
    except Exception as e:
        raise Exception(f"MongoDB fetch failed: {str(e)}")

def create_mongo_user(mongo, user_data):
    """Create a user in MongoDB"""
    try:
        user = User(
            email=user_data['email'],
            password=user_data['password'],
            name=user_data.get('name', '')
        )
        result = mongo.users.insert_one(user.to_dict())
        user._id = result.inserted_id
        return user
    except Exception as e:
        raise Exception(f"MongoDB user creation failed: {str(e)}")

def get_mongo_user_by_email(mongo, email):
    """Get a user by email from MongoDB"""
    try:
        user_data = mongo.users.find_one({'email': email})
        if not user_data:
            return None
        return User.from_dict(user_data)
    except Exception as e:
        raise Exception(f"MongoDB user fetch failed: {str(e)}")

def get_mongo_user_by_id(mongo, user_id):
    """Get a user by ID from MongoDB"""
    try:
        user_data = mongo.users.find_one({'_id': ObjectId(user_id)})
        if not user_data:
            return None
        return User.from_dict(user_data)
    except Exception as e:
        raise Exception(f"MongoDB user fetch failed: {str(e)}")

def update_mongo_user_login_time(mongo, user_id):
    """Update a user's last login time in MongoDB"""
    try:
        last_login = datetime.now(timezone.utc)
        result = mongo.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'last_login': last_login}}
        )
        if result.modified_count == 0:
            raise Exception("No user was updated")
        return last_login
    except Exception as e:
        raise Exception(f"MongoDB user login update failed: {str(e)}")

def update_mongo_user(mongo, user_id, update_fields):
    """Update user fields in MongoDB"""
    try:
        result = mongo.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_fields}
        )
        if result.modified_count == 0:
            raise Exception("No user was updated")
            
        updated_user = mongo.users.find_one({'_id': ObjectId(user_id)})
        return User.from_dict(updated_user)
    except Exception as e:
        raise Exception(f"MongoDB user update failed: {str(e)}")

def get_mongo_users_name_and_id(mongo):
    """Get only names and IDs of all users from MongoDB"""
    try:
        # Use projection to only retrieve _id and name fields
        users = mongo.users.find({}, {'_id': 1, 'name': 1})
        
        # Format results as a list of dictionaries with id and name
        result = []
        for user in users:
            result.append({
                'id': str(user['_id']),
                'name': user.get('name', '')
            })
        
        return result
    except Exception as e:
        raise Exception(f"MongoDB user name/id fetch failed: {str(e)}")