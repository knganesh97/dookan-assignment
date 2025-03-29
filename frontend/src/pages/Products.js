import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import axios from '../utils/axios';

const ProductModal = ({ isOpen, onClose, product, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    sku: '',
    ...product,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description,
        price: product.priceRange?.minVariantPrice?.amount || '',
        sku: product.sku || '',
      });
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{product ? 'Edit Product' : 'Add New Product'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Product title"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Price</FormLabel>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Product price"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>SKU</FormLabel>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Product SKU"
                />
              </FormControl>
              <Button type="submit" colorScheme="blue" width="full">
                {product ? 'Update Product' : 'Add Product'}
              </Button>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products', {
        params: {
          page: pagination.page,
          per_page: pagination.per_page,
          sort_by: 'created_at',
          order: 'desc'
        }
      });
      setProducts(response.data.products);
      setPagination({
        page: response.data.page,
        per_page: response.data.per_page,
        total: response.data.total,
        total_pages: response.data.total_pages
      });
    } catch (error) {
      toast({
        title: 'Error fetching products',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [pagination.page]);

  const handleAddProduct = async (formData) => {
    try {
      const response = await axios.post('/products', formData);
      if (response.status === 201) {
        toast({
          title: 'Product added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        fetchProducts();
      }
    } catch (error) {
      toast({
        title: 'Error adding product',
        description: error.response?.data?.error || error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditProduct = async (formData) => {
    try {
      const response = await axios.put(`/products/${formData._id}`, formData);
      if (response.status === 200) {
        toast({
          title: 'Product updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        fetchProducts();
      }
    } catch (error) {
      toast({
        title: 'Error updating product',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await axios.delete(`/products/${productId}`);
        if (response.status === 200) {
          toast({
            title: 'Product deleted successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          fetchProducts();
        }
      } catch (error) {
        toast({
          title: 'Error deleting product',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading>Products</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onOpen}>
          Add Product
        </Button>
      </Box>

      {products.length === 0 ? (
        <Text>No products found</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Description</Th>
                <Th>Price</Th>
                <Th>SKU</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {products.map((product) => (
                <Tr key={product._id}>
                  <Td>{product.title}</Td>
                  <Td>{product.description}</Td>
                  <Td>${product.price.toFixed(2)}</Td>
                  <Td>{product.sku}</Td>
                  <Td>{product.status}</Td>
                  <Td>
                    <Button
                      size="sm"
                      mr={2}
                      onClick={() => {
                        setSelectedProduct(product);
                        onOpen();
                      }}
                    >
                      <FiEdit2 />
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      <FiTrash2 />
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <Box mt={4} display="flex" justifyContent="center">
        <Button
          isDisabled={pagination.page === 1}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          mr={2}
        >
          Previous
        </Button>
        <Text alignSelf="center" mx={4}>
          Page {pagination.page} of {pagination.total_pages}
        </Text>
        <Button
          isDisabled={pagination.page === pagination.total_pages}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          ml={2}
        >
          Next
        </Button>
      </Box>

      <ProductModal
        isOpen={isOpen}
        onClose={onClose}
        product={selectedProduct}
        onSubmit={selectedProduct ? handleEditProduct : handleAddProduct}
      />
    </Box>
  );
};

export default Products;