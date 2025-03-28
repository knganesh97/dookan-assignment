import os
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport

def get_shopify_client():
    store_url = os.getenv('SHOPIFY_STORE_URL')
    if not store_url:
        raise ValueError("SHOPIFY_STORE_URL environment variable is required")
        
    transport = RequestsHTTPTransport(
        url=f'https://{store_url}/admin/api/2024-01/graphql.json',
        headers={
            'X-Shopify-Access-Token': os.getenv('SHOPIFY_ACCESS_TOKEN'),
            'Content-Type': 'application/json'
        },
        verify=True
    )
    return Client(transport=transport, fetch_schema_from_transport=True)

def create_shopify_product(product_data):
    """Create a product in Shopify"""
    client = get_shopify_client()
    
    # First create the product without images
    mutation = gql("""
        mutation productCreate($input: ProductInput!) {
            productCreate(input: $input) {
                product {
                    id
                    title
                    descriptionHtml
                    variants(first: 1) {
                        edges {
                            node {
                                price
                                sku
                            }
                        }
                    }
                }
                userErrors {
                    field
                    message
                }
            }
        }
    """)
    
    variables = {
        "input": {
            "title": product_data['title'],
            "descriptionHtml": product_data['description'],
            "variants": [{
                "price": str(product_data['price']),
                "sku": product_data['sku']
            }]
        }
    }
    
    result = client.execute(mutation, variable_values=variables)
    
    if result['productCreate']['userErrors']:
        return None
        
    product = result['productCreate']['product']
    
    # If we have an image URL, add it as a separate step
    if product_data.get('image_url'):
        try:
            # Create a new mutation to add the image
            image_mutation = gql("""
                mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
                    productCreateMedia(productId: $productId, media: $media) {
                        media {
                            ... on MediaImage {
                                image {
                                    url
                                }
                            }
                        }
                        mediaUserErrors {
                            field
                            message
                        }
                    }
                }
            """)
            
            image_variables = {
                "productId": product['id'],
                "media": [{
                    "mediaContentType": "IMAGE",
                    "originalSource": product_data['image_url']
                }]
            }
            
            image_result = client.execute(image_mutation, variable_values=image_variables)
            if image_result['productCreateMedia']['mediaUserErrors']:
                # Log the error but don't fail the whole operation
                print(f"Failed to add image: {image_result['productCreateMedia']['mediaUserErrors']}")
                
        except Exception as e:
            # Log the error but don't fail the whole operation
            print(f"Error adding image: {str(e)}")
    
    return product

def update_shopify_product(shopify_id, product_data):
    """Update a product in Shopify"""
    client = get_shopify_client()
    
    mutation = gql("""
        mutation productUpdate($input: ProductInput!) {
            productUpdate(input: $input) {
                product {
                    id
                    title
                    description
                    variants(first: 1) {
                        edges {
                            node {
                                price
                                sku
                            }
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
                userErrors {
                    field
                    message
                }
            }
        }
    """)
    
    variables = {
        "input": {
            "id": shopify_id,
            "title": product_data.get('title'),
            "description": product_data.get('description'),
            "variants": [{
                "price": str(product_data.get('price')),
                "sku": product_data.get('sku')
            }] if product_data.get('price') or product_data.get('sku') else [],
            "images": [{
                "url": product_data.get('image_url')
            }] if product_data.get('image_url') else []
        }
    }
    
    result = client.execute(mutation, variable_values=variables)
    return result['productUpdate']['product'] if not result['productUpdate']['userErrors'] else None

def delete_shopify_product(shopify_id):
    """Delete a product in Shopify"""
    client = get_shopify_client()
    
    mutation = gql("""
        mutation productDelete($input: ProductDeleteInput!) {
            productDelete(input: $input) {
                deletedProductId
                userErrors {
                    field
                    message
                }
            }
        }
    """)
    
    variables = {
        "input": {
            "id": shopify_id
        }
    }
    
    result = client.execute(mutation, variable_values=variables)
    return result['productDelete']['deletedProductId'] if not result['productDelete']['userErrors'] else None 