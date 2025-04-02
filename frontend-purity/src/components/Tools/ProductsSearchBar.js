import React from "react";
import {
  Button,
  FormControl,
  InputGroup,
  InputLeftElement,
  Input,
  Flex,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

const ProductsSearchBar = ({ onSearch, searchQuery }) => {
  const handleSearch = (event) => {
    event.preventDefault();
    const query = event.target.search.value;
    onSearch(query);
  };

  return (
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
  );
};

export default ProductsSearchBar; 