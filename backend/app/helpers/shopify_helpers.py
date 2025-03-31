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
    
    # Prepare the update input
    update_input = {
        "id": shopify_id
    }
    
    # Add fields only if they're present in the data
    if 'title' in product_data:
        update_input["title"] = product_data['title']
        
    if 'description' in product_data:
        # Use descriptionHtml instead of description
        update_input["descriptionHtml"] = product_data['description']
    
    # Handle variants (price and SKU)
    if 'price' in product_data or 'sku' in product_data:
        variant_data = {}
        if 'price' in product_data:
            variant_data["price"] = str(product_data['price'])
        if 'sku' in product_data:
            variant_data["sku"] = product_data['sku']
        
        update_input["variants"] = [variant_data]
    
    # Handle image explicitly
    # Images need to be handled differently in update vs create
    # For update, we need to use the media field or a different approach
    
    mutation = gql("""
        mutation productUpdate($input: ProductInput!) {
            productUpdate(input: $input) {
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
        "input": update_input
    }
    
    # Log the input for debugging
    print(f"Sending to Shopify: {variables}")
    
    result = client.execute(mutation, variable_values=variables)
    
    # Log any errors for debugging
    if result['productUpdate']['userErrors']:
        print(f"Shopify update errors: {result['productUpdate']['userErrors']}")
        return None
    
    product = result['productUpdate']['product']
    
    # If we need to update the image and it was in the original request, 
    # handle it as a separate operation after updating the other fields
    if 'image_url' in product_data:
        try:
            # First, we may need to delete existing images
            delete_images_mutation = gql("""
                mutation productDeleteImages($productId: ID!) {
                    productDeleteImages(productId: $productId) {
                        deletedImageIds
                        userErrors {
                            field
                            message
                        }
                    }
                }
            """)
            
            delete_variables = {
                "productId": shopify_id
            }
            
            # Delete existing images
            delete_result = client.execute(delete_images_mutation, variable_values=delete_variables)
            
            if delete_result['productDeleteImages']['userErrors']:
                print(f"Error deleting images: {delete_result['productDeleteImages']['userErrors']}")
            
            # If there's a new image, add it
            if product_data['image_url'] and product_data['image_url'].strip():
                print(f"Adding new image: {product_data['image_url']}")
                
                # Add new image using the media API
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
                    "productId": shopify_id,
                    "media": [{
                        "mediaContentType": "IMAGE",
                        "originalSource": product_data['image_url']
                    }]
                }
                
                image_result = client.execute(image_mutation, variable_values=image_variables)
                
                if image_result['productCreateMedia']['mediaUserErrors']:
                    print(f"Error adding image: {image_result['productCreateMedia']['mediaUserErrors']}")
                
        except Exception as e:
            print(f"Error handling images: {str(e)}")
            # Don't fail the whole update if image handling fails
            
    return product

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