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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getProducts();
        console.log('API Response:', response);
        
        // The response is already unwrapped by the interceptor
        if (response?.products) {
          console.log('Setting products:', response.products);
          setProducts(response.products);
        } else {
          console.log('No products found in response');
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

    fetchProducts();
  }, []);

  console.log('Current products state:', products);

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Products
        title={"Products Table"}
        captions={["Product", "SKU", "Price", "Status", "Created", ""]}
        data={products}
        loading={loading}
        error={error}
      />
      <Authors
        title={"Authors Table"}
        captions={["Author", "Function", "Status", "Employed", ""]}
        data={tablesTableData}
      />
      <Projects
        title={"Projects Table"}
        captions={["Companies", "Budget", "Status", "Completion", ""]}
        data={dashboardTableData}
      />
    </Flex>
  );
}

export default Tables;
