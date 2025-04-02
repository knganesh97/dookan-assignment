import React from "react";
import {
  SimpleGrid,
  Box,
  Button,
  Flex,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import ProductsSearchBar from "./ProductsSearchBar";
import RowsPerPage from "./RowsPerPage";
import PageNavigation from "./PageNavigation";

const ProductsToolbar = ({
  pageNumber,
  perPage,
  setPageNumber,
  setPerPage,
  hasMorePages,
  onSearch,
  searchQuery,
  onCreateNew
}) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} w="100%" mb={4} alignItems="center" justifyContent="space-between">
      <Box>
        <RowsPerPage 
          perPage={perPage}
          setPerPage={setPerPage}
        />
      </Box>

      <Box>
        <PageNavigation 
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
          hasMorePages={hasMorePages}
        />
      </Box>
      
      <Box>
        <ProductsSearchBar 
          onSearch={onSearch}
          searchQuery={searchQuery}
        />
      </Box>
      
      <Flex justifyContent="center" align="center">
        <Button
            size="sm"
            colorScheme="green"
            leftIcon={<AddIcon />}
            onClick={onCreateNew}
        >
            Create
        </Button>
      </Flex>
    </SimpleGrid>
  );
};

export default ProductsToolbar; 