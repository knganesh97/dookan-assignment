import React from "react";
import {
  HStack,
  IconButton,
  Text,
  Box,
} from "@chakra-ui/react";
import { FaSortUp, FaSortDown } from "react-icons/fa";

const PageNavigation = ({ 
  pageNumber, 
  setPageNumber, 
  hasMorePages 
}) => {
  return (
    <Box>
      <HStack spacing={2} justifyContent="flex-start" alignItems="center">
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
          isDisabled={!hasMorePages}
          aria-label="Next page"
        />
      </HStack>
    </Box>
  );
};

export default PageNavigation; 