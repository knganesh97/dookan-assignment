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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
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
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import moment from "moment";
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";

const Products = ({ 
    title, captions, data = [], loading = false, error = null, 
    setPageNumber, setPerPage, setSortBy, setSortOrder,
    pageNumber, perPage, sortBy, sortOrder, onSearch, searchQuery
}) => {
  const textColor = useColorModeValue("gray.700", "white");
  const colorStatus = useColorModeValue("white", "gray.400");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = React.useState(null);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    onOpen();
  };

  const handleEdit = (product) => {
    // TODO: Implement edit functionality
    console.log('Edit product:', product);
  };

  const handleDelete = (product) => {
    // TODO: Implement delete functionality
    console.log('Delete product:', product);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "synced":
        return "green.600";
      case "draft":
        return "yellow.600";
      case "failed":
        return "red.600";
      default:
        return "gray.600";
    }
  };


  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return moment(date).format("MMM DD, YYYY HH:mm");
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
    
    const stringText = String(text);
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = stringText.split(regex);
    
    if (parts.length <= 1) return text;
    
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
  };

  return (
    <Card my='22px' overflowX={{ sm: "scroll", xl: "hidden" }}>
      <CardHeader p='6px 0px 22px 0px'>
        <Flex direction='column'>
          <Text fontSize='lg' color={textColor} fontWeight='bold' pb='.5rem'>
            {title}
          </Text>
          <Flex justify="center" align="center" w="100%" mb={4}>
            <HStack spacing={8}>
              <HStack spacing={4}>
                <Text>Rows per page:</Text>
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
              
              <FormControl as="form" onSubmit={handleSearch}>
                <InputGroup size="sm" width="200px">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input 
                    name="search"
                    placeholder="Search products..." 
                    defaultValue={searchQuery}
                  />
                </InputGroup>
              </FormControl>
              
              <HStack spacing={2}>
                <IconButton
                  size="sm"
                  icon={<FaSortUp />}
                  onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                  isDisabled={pageNumber === 1}
                />
                <Text>Page {pageNumber}</Text>
                <IconButton
                  size="sm"
                  icon={<FaSortDown />}
                  onClick={() => setPageNumber(prev => prev + 1)}
                  isDisabled={data.length < perPage}
                />
              </HStack>
            </HStack>
          </Flex>
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
        ) : data.length === 0 ? (
          <Center py={8}>
            <Text color={textColor}>No products found</Text>
          </Center>
        ) : (
            <>
                <Table variant='simple' color={textColor}>
                    <Thead>
                        <Tr my='.8rem' pl='0px'>
                        {captions.map((caption, idx) => {
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
                        {data.map((row) => {
                        return (
                            <Tr key={row.id || row._id}>
                            <Th>
                                <Flex align="center" py=".8rem" minWidth="100%" flexWrap="nowrap">
                                {row.image_url && (
                                    <Image
                                    src={row.image_url}
                                    alt={row.title || "Product Image"}
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
                                    {searchQuery ? highlightSearchMatch(row.title || "Untitled Product", searchQuery) : (row.title || "Untitled Product")}
                                </Text>
                            </Th>
                            <Th>
                                <Text fontSize="sm" color={textColor} fontWeight="bold">
                                {searchQuery ? highlightSearchMatch(row.sku || "N/A", searchQuery) : (row.sku || "N/A")}
                                </Text>
                            </Th>
                            <Th>
                                <Text fontSize="sm" color={textColor} fontWeight="bold">
                                {searchQuery ? highlightSearchMatch(`$${(row.price || 0).toFixed(2)}`, searchQuery) : `$${(row.price || 0).toFixed(2)}`}
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

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Product Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedProduct && (
              <Box>
                {selectedProduct.image_url && (
                  <Image
                    src={selectedProduct.image_url}
                    alt={selectedProduct.title || "Product Image"}
                    width="100%"
                    height="300px"
                    objectFit="cover"
                    borderRadius="8px"
                    mb="24px"
                  />
                )}
                <Text fontSize="lg" fontWeight="bold" mb="16px">
                  {searchQuery ? highlightSearchMatch(selectedProduct.title || "Untitled Product", searchQuery) : (selectedProduct.title || "Untitled Product")}
                </Text>
                <Text fontSize="md" mb="8px">
                  <strong>Description:</strong> {searchQuery ? highlightSearchMatch(selectedProduct.description || "No description available", searchQuery) : (selectedProduct.description || "No description available")}
                </Text>
                <Text fontSize="md" mb="8px">
                  <strong>SKU:</strong> {searchQuery ? highlightSearchMatch(selectedProduct.sku || "N/A", searchQuery) : (selectedProduct.sku || "N/A")}
                </Text>
                <Text fontSize="md" mb="8px">
                  <strong>Price:</strong> {searchQuery ? highlightSearchMatch(`$${(selectedProduct.price || 0).toFixed(2)}`, searchQuery) : `$${(selectedProduct.price || 0).toFixed(2)}`}
                </Text>
                <Text fontSize="md" mb="8px">
                  <strong>Status:</strong>{" "}
                  <Badge
                    bg={getStatusColor(selectedProduct.status)}
                    color={colorStatus}
                    fontSize="14px"
                    p="2px 8px"
                    borderRadius="6px"
                  >
                    {selectedProduct.status || "unknown"}
                  </Badge>
                </Text>
                <Text fontSize="md" mb="8px">
                  <strong>Created:</strong>{" "}
                  {formatDateTime(selectedProduct.created_at)}
                </Text>
                <Text fontSize="md" mb="8px">
                  <strong>Last Updated:</strong>{" "}
                  {formatDateTime(selectedProduct.updated_at)}
                </Text>
                {selectedProduct.last_sync && (
                  <Text fontSize="md" mb="8px">
                    <strong>Last Sync:</strong>{" "}
                    {formatDateTime(selectedProduct.last_sync)}
                  </Text>
                )}
                {selectedProduct.shopify_id && (
                  <Text fontSize="md" mb="8px">
                    <strong>Shopify ID:</strong> {selectedProduct.shopify_id}
                  </Text>
                )}
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Card>
  );
}

export default Products; 