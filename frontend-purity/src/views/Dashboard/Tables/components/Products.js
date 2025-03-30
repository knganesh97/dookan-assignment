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
} from "@chakra-ui/react";
import moment from "moment";
// Custom components
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";

function Products({ title, captions, data = [], loading = false, error = null }) {
  const textColor = useColorModeValue("gray.700", "white");
  const colorStatus = useColorModeValue("white", "gray.400");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = React.useState(null);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    onOpen();
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

  const formatDate = (date) => {
    if (!date) return "N/A";
    return moment(date).format("MMM DD, YYYY");
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return moment(date).format("MMM DD, YYYY HH:mm");
  };

  return (
    <Card my='22px' overflowX={{ sm: "scroll", xl: "hidden" }}>
      <CardHeader p='6px 0px 22px 0px'>
        <Flex direction='column'>
          <Text fontSize='lg' color={textColor} fontWeight='bold' pb='.5rem'>
            {title}
          </Text>
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
          <Table variant='simple' color={textColor}>
            <Thead>
              <Tr my='.8rem' pl='0px'>
                {captions.map((caption, idx) => {
                  return (
                    <Th color='gray.400' key={idx} ps={idx === 0 ? "0px" : null}>
                      {caption}
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
                        {row.thumbnail_url && (
                          <Image
                            src={row.thumbnail_url}
                            alt={row.title || "Product Image"}
                            width="40px"
                            height="40px"
                            borderRadius="8px"
                            mr="12px"
                          />
                        )}
                        <Text
                          fontSize="sm"
                          color={textColor}
                          fontWeight="bold"
                          minWidth="100%"
                        >
                          {row.title || "Untitled Product"}
                        </Text>
                      </Flex>
                    </Th>
                    <Th>
                      <Text fontSize="sm" color={textColor} fontWeight="bold">
                        {row.sku || "N/A"}
                      </Text>
                    </Th>
                    <Th>
                      <Text fontSize="sm" color={textColor} fontWeight="bold">
                        ${(row.price || 0).toFixed(2)}
                      </Text>
                    </Th>
                    <Th>
                      <Badge
                        bg={getStatusColor(row.status)}
                        color={colorStatus}
                        fontSize="16px"
                        p="3px 10px"
                        borderRadius="8px"
                      >
                        {row.status || "unknown"}
                      </Badge>
                    </Th>
                    <Th>
                      <Text fontSize="sm" color={textColor} fontWeight="bold">
                        {formatDate(row.created_at)}
                      </Text>
                    </Th>
                    <Th>
                      <Button
                        colorScheme="blue"
                        size="sm"
                        onClick={() => handleViewDetails(row)}
                      >
                        View Details
                      </Button>
                    </Th>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
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
                  {selectedProduct.title || "Untitled Product"}
                </Text>
                <Text fontSize="md" mb="8px">
                  <strong>Description:</strong> {selectedProduct.description || "No description available"}
                </Text>
                <Text fontSize="md" mb="8px">
                  <strong>SKU:</strong> {selectedProduct.sku || "N/A"}
                </Text>
                <Text fontSize="md" mb="8px">
                  <strong>Price:</strong> ${(selectedProduct.price || 0).toFixed(2)}
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