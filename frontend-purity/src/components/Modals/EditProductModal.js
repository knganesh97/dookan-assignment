import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Box,
  Image,
} from "@chakra-ui/react";
import productService from "services/product.service";

const EditProductModal = ({ isOpen, onClose, product, onProductUpdated, isCreateMode = false }) => {
  const [editedProduct, setEditedProduct] = useState({
    title: "",
    description: "",
    price: "",
    sku: "",
    image_url: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Initialize form with product data when opened
  useEffect(() => {
    if (product && isOpen) {
      setEditedProduct({
        title: product.title || "",
        description: product.description || "",
        price: product.price ? product.price.toString() : "",
        sku: product.sku || "",
        image_url: product.image_url || ""
      });
      setFormErrors({});
    }
  }, [product, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct({
      ...editedProduct,
      [name]: value
    });
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ""
      });
    }
  };

  const handlePriceChange = (value) => {
    setEditedProduct({
      ...editedProduct,
      price: value
    });
    // Clear error when field is edited
    if (formErrors.price) {
      setFormErrors({
        ...formErrors,
        price: ""
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!editedProduct.title?.trim()) {
      errors.title = "Title is required";
    }
    if (!editedProduct.description?.trim()) {
      errors.description = "Description is required";
    }
    if (!editedProduct.price) {
      errors.price = "Price is required";
    } else if (isNaN(parseFloat(editedProduct.price)) || parseFloat(editedProduct.price) <= 0) {
      errors.price = "Price must be a positive number";
    }
    if (!editedProduct.sku?.trim()) {
      errors.sku = "SKU is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    console.log("handleSubmit called, isCreateMode:", isCreateMode);
    
    const isValid = validateForm();
    console.log("Form validation result:", isValid);
    
    if (!isValid) {
      console.log("Form validation failed with errors:", formErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Format price as number
      const productData = {
        ...editedProduct,
        price: parseFloat(editedProduct.price)
      };
      
      console.log("Formatted product data:", productData);
      
      if (isCreateMode) {
        console.log("Creating new product...");
        // Create new product
        await productService.createProduct(productData);
        
        // Show success message
        toast({
          title: "Product created",
          description: "The product was successfully created",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Update existing product
        // Get the product ID - try different possible ID fields
        const productId = product?.id || product?.mongo_id;
        console.log("Updating product with ID:", productId);
        console.log("Product object:", product);
        
        if (!productId) {
          console.error("Product ID is missing");
          throw new Error("Product ID is missing");
        }
        
        console.log("Calling productService.updateProduct with:", productId, productData);
        try {
          const result = await productService.updateProduct(productId, productData);
          console.log("Update API response:", result);
        } catch (apiError) {
          console.error("API error details:", apiError);
          console.error("API error response:", apiError.response);
          throw apiError;
        }
        
        // Show success message
        toast({
          title: "Product updated",
          description: "The product was successfully updated",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
      
      // Reset form if it's create mode
      if (isCreateMode) {
        setEditedProduct({
          title: "",
          description: "",
          price: "",
          sku: "",
          image_url: ""
        });
      }
      
      onClose();
      
      // Refresh product list
      console.log("Refreshing product list with callback:", onProductUpdated);
      if (onProductUpdated) {
        onProductUpdated();
      }
    } catch (error) {
      console.error(`Failed to ${isCreateMode ? 'create' : 'update'} product:`, error);
      console.error("Error stack:", error.stack);
      toast({
        title: `Error ${isCreateMode ? 'creating' : 'updating'} product`,
        description: error.response?.data?.error || "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    // Reset form if it's create mode
    if (isCreateMode) {
      setEditedProduct({
        title: "",
        description: "",
        price: "",
        sku: "",
        image_url: ""
      });
    }
    setFormErrors({});
    onClose();
  };

  // Don't render if no product is provided
  if (!product && !isCreateMode) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isCreateMode ? 'Create New Product' : 'Edit Product'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isInvalid={formErrors.title} mb={4} isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              name="title"
              value={editedProduct.title}
              onChange={handleInputChange}
              placeholder="Product title"
            />
            <FormErrorMessage>{formErrors.title}</FormErrorMessage>
          </FormControl>
          
          <FormControl isInvalid={formErrors.description} mb={4} isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              value={editedProduct.description}
              onChange={handleInputChange}
              placeholder="Product description"
              rows={4}
            />
            <FormErrorMessage>{formErrors.description}</FormErrorMessage>
          </FormControl>
          
          <HStack spacing={4} mb={4}>
            <FormControl isInvalid={formErrors.price} isRequired>
              <FormLabel>Price</FormLabel>
              <NumberInput
                min={0.01}
                precision={2}
                step={0.01}
                value={editedProduct.price}
                onChange={handlePriceChange}
              >
                <NumberInputField 
                  name="price" 
                  placeholder="0.00" 
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{formErrors.price}</FormErrorMessage>
            </FormControl>
            
            <FormControl isInvalid={formErrors.sku} isRequired>
              <FormLabel>SKU</FormLabel>
              <Input
                name="sku"
                value={editedProduct.sku}
                onChange={handleInputChange}
                placeholder="Product SKU"
              />
              <FormErrorMessage>{formErrors.sku}</FormErrorMessage>
            </FormControl>
          </HStack>
          
          <FormControl mb={4}>
            <FormLabel>Image URL</FormLabel>
            <HStack>
              <Input
                name="image_url"
                value={editedProduct.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
              <Button 
                size="sm" 
                colorScheme="red" 
                onClick={() => {
                  setEditedProduct({
                    ...editedProduct,
                    image_url: ""
                  });
                  // Clear error if it exists
                  if (formErrors.image_url) {
                    setFormErrors({
                      ...formErrors,
                      image_url: ""
                    });
                  }
                }}
              >
                Clear
              </Button>
            </HStack>
            <FormErrorMessage>{formErrors.image_url}</FormErrorMessage>
            {editedProduct.image_url && (
              <Box mt={2} maxW="200px">
                <Image 
                  src={editedProduct.image_url} 
                  alt="Product preview" 
                  maxHeight="100px" 
                  fallbackSrc="https://via.placeholder.com/100x100?text=Preview" 
                />
              </Box>
            )}
          </FormControl>
        </ModalBody>
        
        <ModalFooter>
          <Button 
            colorScheme="blue" 
            mr={3} 
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText={isCreateMode ? "Creating" : "Updating"}
          >
            {isCreateMode ? "Create" : "Update"}
          </Button>
          <Button onClick={handleCloseModal}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditProductModal; 