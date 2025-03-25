from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
import os

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

@shopify_bp.route('/products', methods=['GET'])
@jwt_required()
def get_products():
    client = get_shopify_client()
    
    query = gql("""
        query {
            products(first: 10) {
                edges {
                    node {
                        id
                        title
                        description
                        priceRange {
                            minVariantPrice {
                                amount
                            }
                        }
                        images(first: 1) {
                            edges {
                                node {
                                    url
                                }
                            }
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