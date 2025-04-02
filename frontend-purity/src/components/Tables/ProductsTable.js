import React from "react";
import {
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  Flex,
  Image,
  Button,
  Box,
} from "@chakra-ui/react";
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const ProductsTable = ({ 
  captions = [], 
  data = [], 
  textColor, 
  sortBy, 
  sortOrder, 
  handleSort, 
  handleViewDetails, 
  handleEdit, 
  handleDelete,
  searchQuery,
  highlightSearchMatch
}) => {
  
  const getSortIcon = (column) => {
    if (sortBy !== column) return <FaSort />;
    return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  return (
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
  );
};

export default ProductsTable; 