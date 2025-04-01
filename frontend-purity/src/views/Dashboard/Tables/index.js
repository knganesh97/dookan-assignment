// Chakra imports
import { Flex } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Authors from "./components/Authors";
import Projects from "./components/Projects";
import Products from "./components/Products";
import { tablesTableData, dashboardTableData } from "variables/general";
import productService from "services/product.service";

function Tables() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = async (params = {}) => {
    try {
      setLoading(true);
      const response = await productService.getProducts({
        ...params,
        q: searchQuery
      });
      
      if (response?.products && Array.isArray(response.products)) {
        setProducts(response.products);
      } else {
        console.warn("Received invalid products data:", response);
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = {
      page: pageNumber,
      per_page: perPage,
      sort_by: sortBy,
      order: sortOrder
    };
    fetchProducts(params);
  }, [pageNumber, perPage, sortBy, sortOrder, searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPageNumber(1); // Reset to first page when searching
  };

  // Handler for product creation or update
  const handleProductUpdated = () => {
    // Refresh the products list
    fetchProducts({
      page: pageNumber,
      per_page: perPage,
      sort_by: sortBy,
      order: sortOrder
    });
  };

  console.log('Current products state:', products);

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Products
        title={"Products Table"}
        captions={["Image", "Title", "SKU", "Price", "Edit", "Delete"]}
        data={products}
        loading={loading}
        error={error}
        setPageNumber={setPageNumber}
        setPerPage={setPerPage}
        setSortBy={setSortBy}
        setSortOrder={setSortOrder}
        pageNumber={pageNumber}
        perPage={perPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onProductCreated={handleProductUpdated}
        onProductUpdated={handleProductUpdated}
      />
      {/* <Authors
        title={"Authors Table"}
        captions={["Author", "Function", "Status", "Employed", ""]}
        data={tablesTableData}
      />
      <Projects
        title={"Projects Table"}
        captions={["Companies", "Budget", "Status", "Completion", ""]}
        data={dashboardTableData}
      /> */}
    </Flex>
  );
}

export default Tables;
