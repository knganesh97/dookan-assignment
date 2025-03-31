import React from "react";
import {
  useColorModeValue,
  useDisclosure,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Text,
  useToast,
  Flex,
} from "@chakra-ui/react";

// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import ViewProductModal from "./ViewProductModal";
import EditProductModal from "./EditProductModal";
import productService from "services/product.service";

// New modular components
import ProductsTable from "./ProductsTable";
import ProductsToolbar from "./ProductsToolbar";
import ProductsDeleteDialog from "./ProductsDeleteDialog";
import { highlightSearchMatch } from "./ProductsUtility";

const Products = ({ 
    title, captions = [], data = [], loading = false, error = null, 
    setPageNumber, setPerPage, setSortBy, setSortOrder,
    pageNumber, perPage, sortBy, sortOrder, onSearch, searchQuery,
    onProductCreated, onProductUpdated,
}) => {
  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();
  const cancelRef = React.useRef();
  
  // View product modal state
  const { 
    isOpen: isViewModalOpen, 
    onOpen: onViewModalOpen, 
    onClose: onViewModalClose 
  } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  
  // Product form modal state (for both create and edit)
  const { 
    isOpen: isFormModalOpen, 
    onOpen: onFormModalOpen, 
    onClose: onFormModalClose 
  } = useDisclosure();
  const [isCreateMode, setIsCreateMode] = React.useState(false);
  const [productToEdit, setProductToEdit] = React.useState(null);
  const emptyProduct = {
    id: null,
    title: "",
    description: "",
    price: "",
    sku: "",
    image_url: ""
  };

  // Delete product confirmation dialog
  const {
    isOpen: isDeleteDialogOpen,
    onOpen: onDeleteDialogOpen,
    onClose: onDeleteDialogClose
  } = useDisclosure();
  const [productToDelete, setProductToDelete] = React.useState(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    onViewModalOpen();
  };

  const handleEdit = (product) => {
    setIsCreateMode(false);
    setProductToEdit(product);
    onFormModalOpen();
  };

  const handleCreateNew = () => {
    setIsCreateMode(true);
    setProductToEdit(emptyProduct);
    onFormModalOpen();
  };

  const handleDelete = (product) => {
    // Open the confirmation dialog
    setProductToDelete(product);
    onDeleteDialogOpen();
  };

  const confirmDelete = async () => {
    if (!productToDelete || !productToDelete.id) {
      toast({
        title: "Error",
        description: "Product ID is missing",
        status: "error",
        duration: 5000,
        isClosable: true
      });
      onDeleteDialogClose();
      return;
    }

    setIsDeleting(true);
    
    try {
      // Call the delete API
      await productService.deleteProduct(productToDelete.id);
      
      // Show success toast
      toast({
        title: "Product deleted",
        description: `"${productToDelete.title}" has been deleted successfully`,
        status: "success",
        duration: 5000,
        isClosable: true
      });
      
      // Refresh the products list
      if (onProductUpdated) {
        onProductUpdated();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      // Show error toast
      toast({
        title: "Error deleting product",
        description: error.response?.data?.error || "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsDeleting(false);
      onDeleteDialogClose();
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Check if there might be more pages
  const hasMorePages = data && Array.isArray(data) && data.length >= perPage;

  return (
    <Card my='22px' overflowX={{ sm: "scroll", xl: "hidden" }}>
      <CardHeader p='6px 0px 22px 0px'>
        <Flex direction='column'>
          <Text fontSize='lg' color={textColor} fontWeight='bold' pb='.5rem'>
            {title}
          </Text>
          
          <ProductsToolbar 
            pageNumber={pageNumber}
            perPage={perPage}
            setPageNumber={setPageNumber}
            setPerPage={setPerPage}
            hasMorePages={hasMorePages}
            onSearch={onSearch}
            searchQuery={searchQuery}
            onCreateNew={handleCreateNew}
          />
        </Flex>
      </CardHeader>
      <CardBody>
        {loading ? (
          <Center py={8}>
            <Spinner size="xl" color="blue.500" />
          </Center>
        ) : error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        ) : !data || !Array.isArray(data) || data.length === 0 ? (
          <Center py={8}>
            <Text color={textColor}>No products found</Text>
          </Center>
        ) : (
          <ProductsTable 
            captions={captions}
            data={data}
            textColor={textColor}
            sortBy={sortBy}
            sortOrder={sortOrder}
            handleSort={handleSort}
            handleViewDetails={handleViewDetails}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            searchQuery={searchQuery}
            highlightSearchMatch={highlightSearchMatch}
          />
        )}
      </CardBody>

      {/* Product Details Modal */}
      <ViewProductModal 
        isOpen={isViewModalOpen} 
        onClose={onViewModalClose} 
        product={selectedProduct}
        searchQuery={searchQuery}
      />

      {/* Product Form Modal (Create/Edit) */}
      <EditProductModal
        isOpen={isFormModalOpen}
        onClose={onFormModalClose}
        product={productToEdit}
        onProductUpdated={isCreateMode ? onProductCreated : (onProductUpdated || onProductCreated)}
        isCreateMode={isCreateMode}
      />

      {/* Delete Confirmation Dialog */}
      <ProductsDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={onDeleteDialogClose}
        product={productToDelete}
        isDeleting={isDeleting}
        onConfirmDelete={confirmDelete}
        cancelRef={cancelRef}
      />
    </Card>
  );
}

export default Products; 