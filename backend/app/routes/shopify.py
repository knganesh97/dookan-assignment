from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
from ..models.product import Product
import os
from datetime import datetime, timezone

shopify_bp = Blueprint('shopify', __name__)

def get_shopify_client():
    transport = RequestsHTTPTransport(
        url='https://your-store.myshopify.com/admin/api/2024-01/graphql.json',
        headers={
            'X-Shopify-Access-Token': os.getenv('SHOPIFY_ACCESS_TOKEN'),
            'Content-Type': 'application/json'
        },
        verify=True
    )
    return Client(transport=transport, fetch_schema_from_transport=True)

@shopify_bp.route('/api/products', methods=['POST'])
@jwt_required()
def create_product():
    """Create a new product"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'description', 'price', 'sku']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create new product
        product = Product(
            title=data['title'],
            description=data['description'],
            price=data['price'],
            sku=data['sku'],
            image_url=data.get('image_url')
        )
        
        # Save to MongoDB
        result = current_app.mongo.products.insert_one(product.to_dict())
        product._id = result.inserted_id
        
        return jsonify(product.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@shopify_bp.route('/api/products', methods=['GET'])
@jwt_required()
def get_products():
    """List all products"""
    try:
        # Get all non-deleted products from MongoDB
        products = current_app.mongo.products.find({'is_deleted': False})
        return jsonify([Product.from_dict(p).to_dict() for p in products]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@shopify_bp.route('/api/products/<product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    """Retrieve product details by ID"""
    try:
        from bson.objectid import ObjectId
        
        # Find product in MongoDB
        product_data = current_app.mongo.products.find_one({
            '_id': ObjectId(product_id),
            'is_deleted': False
        })
        
        if not product_data:
            return jsonify({'error': 'Product not found'}), 404
            
        product = Product.from_dict(product_data)
        return jsonify(product.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@shopify_bp.route('/api/products/<product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """Update an existing product"""
    try:
        from bson.objectid import ObjectId
        
        data = request.get_json()
        
        # Find existing product
        product_data = current_app.mongo.products.find_one({
            '_id': ObjectId(product_id),
            'is_deleted': False
        })
        
        if not product_data:
            return jsonify({'error': 'Product not found'}), 404
        
        # Create update dictionary only for fields present in request
        update_fields = {}
        
        # List of fields that can be updated
        updatable_fields = ['title', 'description', 'price', 'sku', 'image_url', 'status']
        
        for field in updatable_fields:
            # Only include field if it's present in the request data
            if field in data:
                # Special handling for price to ensure it's a float
                if field == 'price' and data[field] is not None:
                    update_fields[field] = float(data[field])
                else:
                    update_fields[field] = data[field]
        
        if not update_fields:
            return jsonify({'message': 'No fields to update'}), 400
        
        # Add updated_at timestamp
        update_fields['updated_at'] = datetime.now(timezone.utc)
        
        # Update in MongoDB using $set to only update specified fields
        current_app.mongo.products.update_one(
            {'_id': ObjectId(product_id)},
            {'$set': update_fields}
        )
        
        # Get updated product
        updated_product = current_app.mongo.products.find_one({'_id': ObjectId(product_id)})
        return jsonify(Product.from_dict(updated_product).to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@shopify_bp.route('/api/products/<product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """Delete a product"""
    try:
        from bson.objectid import ObjectId
        
        # Find product
        product_data = current_app.mongo.products.find_one({
            '_id': ObjectId(product_id),
            'is_deleted': False
        })
        
        if not product_data:
            return jsonify({'error': 'Product not found'}), 404
        
        # Soft delete the product
        product = Product.from_dict(product_data)
        product.soft_delete()
        
        # Update in MongoDB
        current_app.mongo.products.update_one(
            {'_id': ObjectId(product_id)},
            {'$set': product.to_dict()}
        )
        
        return jsonify({'message': 'Product deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@shopify_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():
    client = get_shopify_client()
    
    query = gql("""
        query {
            orders(first: 10) {
                edges {
                    node {
                        id
                        name
                        totalPriceSet {
                            shopMoney {
                                amount
                            }
                        }
                        createdAt
                        customer {
                            firstName
                            lastName
                            email
                        }
                    }
                }
            }
        }
    """)
    
    try:
        result = client.execute(query)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@shopify_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_analytics():
    client = get_shopify_client()
    
    query = gql("""
        query {
            shop {
                name
                myshopifyDomain
                plan {
                    displayName
                }
            }
            orders(first: 100) {
                edges {
                    node {
                        totalPriceSet {
                            shopMoney {
                                amount
                            }
                        }
                        createdAt
                    }
                }
            }
        }
    """)
    
    try:
        result = client.execute(query)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500 