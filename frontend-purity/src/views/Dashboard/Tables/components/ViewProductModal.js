import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  Image,
  Box,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import moment from "moment";

const ViewProductModal = ({ isOpen, onClose, product, searchQuery }) => {
  const colorStatus = useColorModeValue("white", "gray.400");

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

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Product Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Box>
            {product?.image_url && (
              <Image
                src={product.image_url}
                alt={product?.title || "Product Image"}
                width="100%"
                height="300px"
                objectFit="cover"
                borderRadius="8px"
                mb="24px"
              />
            )}
            <Text fontSize="lg" fontWeight="bold" mb="16px">
              {searchQuery ? highlightSearchMatch(product?.title || "Untitled Product", searchQuery) : (product?.title || "Untitled Product")}
            </Text>
            <Text fontSize="md" mb="8px">
              <strong>Description:</strong> {searchQuery ? highlightSearchMatch(product?.description || "No description available", searchQuery) : (product?.description || "No description available")}
            </Text>
            <Text fontSize="md" mb="8px">
              <strong>SKU:</strong> {searchQuery ? highlightSearchMatch(product?.sku || "N/A", searchQuery) : (product?.sku || "N/A")}
            </Text>
            <Text fontSize="md" mb="8px">
              <strong>Price:</strong> {searchQuery ? highlightSearchMatch(`$${(product?.price || 0).toFixed(2)}`, searchQuery) : `$${(product?.price || 0).toFixed(2)}`}
            </Text>
            <Text fontSize="md" mb="8px">
              <strong>Status:</strong>{" "}
              <Badge
                bg={getStatusColor(product?.status)}
                color={colorStatus}
                fontSize="14px"
                p="2px 8px"
                borderRadius="6px"
              >
                {product?.status || "unknown"}
              </Badge>
            </Text>
            <Text fontSize="md" mb="8px">
              <strong>Created:</strong>{" "}
              {formatDateTime(product?.created_at)}
            </Text>
            <Text fontSize="md" mb="8px">
              <strong>Last Updated:</strong>{" "}
              {formatDateTime(product?.updated_at)}
            </Text>
            {product?.last_sync && (
              <Text fontSize="md" mb="8px">
                <strong>Last Sync:</strong>{" "}
                {formatDateTime(product?.last_sync)}
              </Text>
            )}
            {product?.shopify_id && (
              <Text fontSize="md" mb="8px">
                <strong>Shopify ID:</strong> {product?.shopify_id}
              </Text>
            )}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ViewProductModal; 