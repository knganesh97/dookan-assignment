import React from "react";
import {
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Badge,
  Image,
  Button,
  useDisclosure,
  Box,
  Flex,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Select,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  FormControl,
  SimpleGrid,
  useToast,
} from "@chakra-ui/react";
import { SearchIcon, AddIcon } from "@chakra-ui/icons";
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import ViewProductModal from "./ViewProductModal";
import EditProductModal from "./EditProductModal";

const Products = ({ 
    title, captions = [], data = [], loading = false, error = null, 
    setPageNumber, setPerPage, setSortBy, setSortOrder,
    pageNumber, perPage, sortBy, sortOrder, onSearch, searchQuery,
    onProductCreated, onProductUpdated,
}) => {
  const textColor = useColorModeValue("gray.700", "white");
  
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
    // TODO: Implement delete functionality
    console.log('Delete product:', product);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return <FaSort />;
    return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = event.target.search.value;
    onSearch(query);
  };

  // Function to highlight search matches in text
  const highlightSearchMatch = (text, query) => {
    if (!query || !text) return text;
    
    try {
      const stringText = String(text);
      const regex = new RegExp(`(${query})`, 'gi');
      const parts = stringText.split(regex);
      
      if (!parts || parts.length <= 1) return text;
      
      return (
        <>
          {parts.map((part, i) => 
            regex.test(part) ? (
              <Box key={i} as="span" bg="yellow.200" fontWeight="bold" px="1" py="0" rounded="sm">
                {part}
              </Box>
            ) : (
              part
            )
          )}
        </>
      );
    } catch (error) {
      console.error("Error in highlightSearchMatch:", error);
      return text;
    }
  };

  return (
    <Card my='22px' overflowX={{ sm: "scroll", xl: "hidden" }}>
      <CardHeader p='6px 0px 22px 0px'>
        <Flex direction='column'>
          <Text fontSize='lg' color={textColor} fontWeight='bold' pb='.5rem'>
            {title}
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="100%" mb={4} alignItems="center">
            <Box>
              <HStack spacing={2} justifyContent="flex-start" h="100%" alignItems="center">
                <Text whiteSpace="nowrap" fontSize="sm">Rows per page:</Text>
                <Select
                  size="sm"
                  width="70px"
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </Select>
              </HStack>
            </Box>
            
            <Box>
              <FormControl as="form" onSubmit={handleSearch}>
                <Flex>
                  <InputGroup size="sm">
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="gray.400" />
                    </InputLeftElement>
                    <Input 
                      name="search"
                      placeholder="Search products..." 
                      defaultValue={searchQuery}
                    />
                  </InputGroup>
                  <Button
                    ml={2}
                    size="sm"
                    colorScheme="blue"
                    type="submit"
                  >
                    Search
                  </Button>
                </Flex>
              </FormControl>
            </Box>
            
            <Flex justifyContent="space-between" align="center">
              <HStack spacing={2}>
                <IconButton
                  size="sm"
                  icon={<FaSortUp />}
                  onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                  isDisabled={pageNumber === 1}
                  aria-label="Previous page"
                />
                <Text whiteSpace="nowrap" fontSize="sm">Page {pageNumber}</Text>
                <IconButton
                  size="sm"
                  icon={<FaSortDown />}
                  onClick={() => setPageNumber(prev => prev + 1)}
                  isDisabled={!data || !Array.isArray(data) || data.length < perPage}
                  aria-label="Next page"
                />
              </HStack>
              <Button
                size="sm"
                colorScheme="green"
                leftIcon={<AddIcon />}
                onClick={handleCreateNew}
              >
                Create
              </Button>
            </Flex>
          </SimpleGrid>
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
            <>
                <Table variant='simple' color={textColor}>
                    <Thead>
                        <Tr my='.8rem' pl='0px'>
                        {captions && Array.isArray(captions) && captions.map((caption, idx) => {
                            const isSortable = ['title', 'sku', 'price'].includes(caption.toLowerCase());
                            return (
                            <Th 
                                color='gray.400' 
                                key={idx} 
                                ps={idx === 0 ? "0px" : null}
                                cursor={isSortable ? "pointer" : "default"}
                                onClick={isSortable ? () => handleSort(caption.toLowerCase()) : undefined}
                            >
                                <Flex align="center">
                                {caption}
                                {isSortable && (
                                    <Box ml={2}>{getSortIcon(caption.toLowerCase())}</Box>
                                )}
                                </Flex>
                            </Th>
                            );
                        })}
                        </Tr>
                    </Thead>
                    <Tbody>
                        {data && Array.isArray(data) && data.map((row, idx) => {
                        return (
                            <Tr key={row?.id || row?._id || idx}>
                            <Th>
                                <Flex align="center" py=".8rem" minWidth="100%" flexWrap="nowrap">
                                {row?.image_url && (
                                    <Image
                                    src={row?.image_url}
                                    alt={row?.title || "Product Image"}
                                    width="40px"
                                    height="40px"
                                    borderRadius="8px"
                                    mr="12px"
                                    />
                                )}
                                </Flex>
                            </Th>
                            <Th>
                                <Text
                                    fontSize="sm"
                                    color={textColor}
                                    fontWeight="bold"
                                    minWidth="100%"
                                    onClick={() => handleViewDetails(row)}
                                    cursor="pointer"
                                >
                                    {searchQuery ? highlightSearchMatch(row?.title || "Untitled Product", searchQuery) : (row?.title || "Untitled Product")}
                                </Text>
                            </Th>
                            <Th>
                                <Text fontSize="sm" color={textColor} fontWeight="bold">
                                {searchQuery ? highlightSearchMatch(row?.sku || "N/A", searchQuery) : (row?.sku || "N/A")}
                                </Text>
                            </Th>
                            <Th>
                                <Text fontSize="sm" color={textColor} fontWeight="bold">
                                {searchQuery ? highlightSearchMatch(`$${(row?.price || 0).toFixed(2)}`, searchQuery) : `$${(row?.price || 0).toFixed(2)}`}
                                </Text>
                            </Th>
                            <Th>
                                <Button
                                    size="sm"
                                    colorScheme="blue"
                                    leftIcon={<FaEdit />}
                                    onClick={() => handleEdit(row)}
                                >
                                    Edit
                                </Button>
                            </Th>
                            <Th>
                                <Button
                                    size="sm"
                                    colorScheme="red"
                                    leftIcon={<FaTrash />}
                                    onClick={() => handleDelete(row)}
                                >
                                    Delete
                                </Button>
                            </Th>
                            </Tr>
                        );
                        })}
                    </Tbody>
                </Table>
            </>
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
    </Card>
  );
}

export default Products; 