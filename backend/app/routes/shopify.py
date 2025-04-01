from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from ..validations.product import ProductValidator
from ..helpers.mongo_helpers import (
    create_mongo_product, 
    update_mongo_product, 
    delete_mongo_product,
    get_mongo_products,
    get_mongo_product_by_id
)
from ..helpers.shopify_helpers import create_shopify_product, update_shopify_product, delete_shopify_product, get_shopify_client
from bson.objectid import ObjectId

shopify_bp = Blueprint('shopify', __name__)

@shopify_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    """Create a new product"""
    try:
        data = request.get_json()
        
        # Validate input data
        validation_errors = ProductValidator.validate_create_data(data)
        if validation_errors:
            return jsonify({'errors': validation_errors}), 400
        
        # Step 1: Create in MongoDB (without shopify_id initially)
        try:
            mongo_product = create_mongo_product(current_app.mongo, data)
        except Exception as mongo_error:
            return jsonify({'error': f'MongoDB creation failed: {str(mongo_error)}'}), 500
        
        # Step 2: Create in Shopify
        try:
            shopify_product = create_shopify_product(data)
            if not shopify_product:
                # Rollback MongoDB creation
                delete_mongo_product(current_app.mongo, str(mongo_product._id))
                return jsonify({'error': 'Failed to create product in Shopify'}), 500
            
            # Update MongoDB with shopify_id
            update_mongo_product(current_app.mongo, str(mongo_product._id), {'shopify_id': shopify_product['id']})
            mongo_product.shopify_id = shopify_product['id']
            
            return jsonify(mongo_product.to_dict()), 201
            
        except Exception as shopify_error:
            # Rollback MongoDB creation
            delete_mongo_product(current_app.mongo, str(mongo_product._id))
            return jsonify({'error': f'Shopify creation failed: {str(shopify_error)}'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@shopify_bp.route('', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_products():
    if request.method == 'OPTIONS':
        return '', 204
        
    """List all products with optional sorting and search"""
    try:
        # Validate query parameters
        validation_errors = ProductValidator.validate_query_params(request.args)
        if validation_errors:
            return jsonify({'errors': validation_errors}), 400
            
        # Get parameters from query string
        sort_field = request.args.get('sort_by', 'created_at')
        sort_order = request.args.get('order', 'desc')
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        search_query = request.args.get('q')
        
        result = get_mongo_products(
            current_app.mongo,
            sort_field=sort_field,
            sort_order=sort_order,
            page=page,
            per_page=per_page,
            search_query=search_query
        )
        
        return jsonify({
            'products': [p.to_dict() for p in result['products']],
            'total': result['total'],
            'page': result['page'],
            'per_page': result['per_page'],
            'total_pages': result['total_pages']
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@shopify_bp.route('/<product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    """Retrieve product details by ID"""
    try:
        # Validate product ID
        validation_errors = ProductValidator.validate_product_id(product_id)
        if validation_errors:
            return jsonify({'errors': validation_errors}), 400
        
        product = get_mongo_product_by_id(current_app.mongo, product_id)
        return jsonify(product.to_dict()), 200
    except Exception as e:
        if str(e) == "Product not found":
            return jsonify({'error': str(e)}), 404
        return jsonify({'error': str(e)}), 500

@shopify_bp.route('/<product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """Update an existing product"""
    try:
        # Validate product ID
        validation_errors = ProductValidator.validate_product_id(product_id)
        if validation_errors:
            return jsonify({'errors': validation_errors}), 400
            
        data = request.get_json()
        
        # Validate update data
        validation_errors = ProductValidator.validate_update_data(data)
        if validation_errors:
            return jsonify({'errors': validation_errors}), 400
        
        # Find existing product and store old data for potential rollback
        old_product_data = current_app.mongo.products.find_one({
            '_id': ObjectId(product_id),
            'is_deleted': False
        })
        
        if not old_product_data:
            return jsonify({'error': 'Product not found'}), 404
        
        # Prepare update fields
        update_fields = {}
        updatable_fields = ['title', 'description', 'price', 'sku', 'image_url', 'status']
        
        for field in updatable_fields:
            if field in data:
                if field == 'price' and data[field] is not None:
                    update_fields[field] = float(data[field])
                else:
                    update_fields[field] = data[field]
        
        if not update_fields:
            return jsonify({'message': 'No fields to update'}), 400
        
        # Step 1: Update in MongoDB
        try:
            mongo_product = update_mongo_product(current_app.mongo, product_id, update_fields)
        except Exception as mongo_error:
            return jsonify({'error': f'MongoDB update failed: {str(mongo_error)}'}), 500
        
        # Step 2: Update in Shopify if shopify_id exists
        if old_product_data.get('shopify_id'):
            try:
                shopify_product = update_shopify_product(old_product_data['shopify_id'], data)
                if not shopify_product:
                    # Rollback MongoDB update using old data
                    update_mongo_product(current_app.mongo, product_id, old_product_data)
                    return jsonify({'error': 'Failed to update product in Shopify'}), 500
                    
            except Exception as shopify_error:
                # Rollback MongoDB update using old data
                update_mongo_product(current_app.mongo, product_id, old_product_data)
                return jsonify({'error': f'Shopify update failed: {str(shopify_error)}'}), 500
        
        return jsonify(mongo_product.to_dict()), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@shopify_bp.route('/<product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """Delete a product"""
    try:
        # Validate product ID
        validation_errors = ProductValidator.validate_product_id(product_id)
        if validation_errors:
            return jsonify({'errors': validation_errors}), 400
        
        # Find product
        product_data = current_app.mongo.products.find_one({
            '_id': ObjectId(product_id),
            'is_deleted': False
        })
        
        if not product_data:
            return jsonify({'error': 'Product not found'}), 404
        
        # Step 1: Soft delete in MongoDB
        try:
            delete_mongo_product(current_app.mongo, product_id)
        except Exception as mongo_error:
            return jsonify({'error': f'MongoDB deletion failed: {str(mongo_error)}'}), 500
        
        # Step 2: Delete from Shopify if shopify_id exists
        if product_data.get('shopify_id'):
            try:
                deleted_id = delete_shopify_product(product_data['shopify_id'])
                if not deleted_id:
                    # Rollback MongoDB soft delete
                    update_mongo_product(current_app.mongo, product_id, {'is_deleted': False})
                    return jsonify({'error': 'Failed to delete product from Shopify'}), 500
                    
            except Exception as shopify_error:
                # Rollback MongoDB soft delete
                update_mongo_product(current_app.mongo, product_id, {'is_deleted': False})
                return jsonify({'error': f'Shopify deletion failed: {str(shopify_error)}'}), 500
        
        return jsonify({'message': 'Product deleted successfully'}), 200
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
