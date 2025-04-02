import React from "react";
import {
  HStack,
  Text,
  Box,
  Select,
} from "@chakra-ui/react";

const RowsPerPage = ({ 
  perPage, 
  setPerPage
}) => {
  return (
    <Box>
      <HStack spacing={2} justifyContent="flex-start" alignItems="center">
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
  );
};

export default RowsPerPage; 